import Lead from '../models/Lead.js';
import Property from '../models/Property.js';
import Client from '../models/Client.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      leadStats,
      propertyStats,
      clientStats,
      dealStats,
      userStats,
      recentLeads,
      recentDeals,
      monthlyData
    ] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Property.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Client.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Deal.aggregate([
        { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Lead.find()
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Deal.find()
        .populate('property', 'title')
        .populate('client', 'name')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      getMonthlyData()
    ]);

    const totalLeads = leadStats.reduce((sum, s) => sum + s.count, 0);
    const totalProperties = propertyStats.reduce((sum, s) => sum + s.count, 0);
    const totalClients = clientStats.reduce((sum, s) => sum + s.count, 0);
    const totalDeals = dealStats.reduce((sum, s) => sum + s.count, 0);
    const totalUsers = userStats.reduce((sum, s) => sum + s.count, 0);

    const wonDeals = dealStats.find(s => s._id === 'won') || { totalValue: 0 };
    const activeProperties = propertyStats.find(s => s._id === 'active') || { count: 0 };

    res.json({
      overview: {
        totalLeads,
        totalProperties,
        totalClients,
        totalDeals,
        totalUsers,
        wonDealsValue: wonDeals.totalValue || 0,
        activeProperties: activeProperties.count
      },
      leads: leadStats,
      properties: propertyStats,
      clients: clientStats,
      deals: dealStats,
      users: userStats,
      recentLeads,
      recentDeals,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function getMonthlyData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const leadsByMonth = await Lead.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const dealsByMonth = await Deal.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
        value: { $sum: '$value' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.getMonth() + 1);
  }

  return months.map(month => ({
    month: monthNames[month - 1],
    leads: leadsByMonth.find(l => l._id === month)?.count || 0,
    deals: dealsByMonth.find(d => d._id === month)?.count || 0,
    dealValue: dealsByMonth.find(d => d._id === month)?.value || 0
  }));
}

export const getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [leads, properties, clients, deals] = await Promise.all([
      Lead.find().sort({ updatedAt: -1 }).limit(10).select('name status updatedAt'),
      Property.find().sort({ updatedAt: -1 }).limit(10).select('title status updatedAt'),
      Client.find().sort({ updatedAt: -1 }).limit(10).select('name type updatedAt'),
      Deal.find().sort({ updatedAt: -1 }).limit(10).select('title stage updatedAt')
    ]);

    const activities = [
      ...leads.map(l => ({ type: 'lead', data: l, date: l.updatedAt })),
      ...properties.map(p => ({ type: 'property', data: p, date: p.updatedAt })),
      ...clients.map(c => ({ type: 'client', data: c, date: c.updatedAt })),
      ...deals.map(d => ({ type: 'deal', data: d, date: d.updatedAt }))
    ].sort((a, b) => b.date - a.date).slice(0, parseInt(limit));

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};