import express from 'express';
import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import Client from '../models/Client.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard overview
router.get('/overview', auth, async (req, res) => {
  try {
    // Get counts
    const totalLeads = await Lead.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalUsers = await User.countDocuments();

    // Get today's new leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = await Lead.countDocuments({ createdAt: { $gte: today } });

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get properties by status
    const propertiesByStatus = await Property.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get deals by stage
    const dealsByStage = await Deal.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    // Get closed deals value
    const closedDeals = await Deal.aggregate([
      { $match: { stage: 'closed' } },
      { $group: { _id: null, total: { $sum: '$dealValue' }, commission: { $sum: '$commission.amount' } } }
    ]);

    res.json({
      counts: {
        totalLeads,
        totalProperties,
        totalClients,
        totalDeals,
        totalUsers,
        todayLeads
      },
      leadsByStatus,
      propertiesByStatus,
      dealsByStage,
      revenue: {
        totalValue: closedDeals[0]?.total || 0,
        totalCommission: closedDeals[0]?.commission || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly statistics
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get leads by month
    const leadsByMonth = await Lead.aggregate([
      {
        $match: { createdAt: { $gte: startDate, $lte: endDate } }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get deals by month
    const dealsByMonth = await Deal.aggregate([
      {
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          stage: 'closed'
        }
      },
      {
        $group: {
          _id: { $month: '$closingDate' },
          count: { $sum: 1 },
          value: { $sum: '$dealValue' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get revenue by month
    const revenueByMonth = await Deal.aggregate([
      {
        $match: { 
          closingDate: { $gte: startDate, $lte: endDate },
          stage: 'closed'
        }
      },
      {
        $group: {
          _id: { $month: '$closingDate' },
          revenue: { $sum: '$dealValue' },
          commission: { $sum: '$commission.amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      leadsByMonth,
      dealsByMonth,
      revenueByMonth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get agent performance
router.get('/agent-performance', auth, async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent', isActive: true }).select('name');

    const performance = await Promise.all(agents.map(async (agent) => {
      const leads = await Lead.countDocuments({ assignedTo: agent._id });
      const deals = await Deal.countDocuments({ assignedTo: agent._id, stage: 'closed' });
      const closedDeals = await Deal.find({ assignedTo: agent._id, stage: 'closed' });
      const revenue = closedDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
      const commission = closedDeals.reduce((sum, deal) => sum + (deal.commission?.amount || 0), 0);

      return {
        agent: agent.name,
        leads,
        deals,
        revenue,
        commission
      };
    }));

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lead conversion rates
router.get('/conversion', auth, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ 
      status: { $in: ['closed', 'qualified'] } 
    });
    
    const leadsToClients = await Client.countDocuments({ source: 'lead' });
    const leadsToDeals = await Deal.countDocuments({ source: 'lead' });

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

    res.json({
      totalLeads,
      convertedLeads,
      leadsToClients,
      leadsToDeals,
      conversionRate: parseFloat(conversionRate)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activities
router.get('/recent-activities', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent leads
    const recentLeads = await Lead.find()
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .then(leads => leads.map(l => ({
        type: 'lead',
        action: 'New lead created',
        details: l.name,
        date: l.createdAt,
        user: l.assignedTo?.name
      })));

    // Get recent deals
    const recentDeals = await Deal.find()
      .populate('assignedTo', 'name')
      .populate('client', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .then(deals => deals.map(d => ({
        type: 'deal',
        action: `Deal ${d.stage}`,
        details: d.client?.name,
        date: d.createdAt,
        user: d.assignedTo?.name
      })));

    // Combine and sort
    const activities = [...recentLeads, ...recentDeals]
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming follow-ups
router.get('/follow-ups', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leads = await Lead.find({
      followUpDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['closed', 'lost'] }
    })
    .populate('assignedTo', 'name')
    .sort({ followUpDate: 1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;