import express from 'express';
import Lead from '../models/Lead.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all leads (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, source, assignedTo, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Agents can only see their leads
    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('notes.addedBy', 'name')
      .populate('convertedToClient')
      .populate('convertedToDeal');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = new Lead(req.body);
    if (req.user.role !== 'admin') {
      lead.assignedTo = req.user._id;
    }
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lead status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign lead to agent
router.patch('/:id/assign', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add note to lead
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.notes.push({
      text,
      addedBy: req.user._id
    });

    await lead.save();
    
    const updatedLead = await Lead.findById(req.params.id)
      .populate('notes.addedBy', 'name');

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lead
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lead statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Lead.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLeads = await Lead.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({
      total,
      todayLeads,
      byStatus: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;