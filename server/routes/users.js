import express from 'express';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin/manager only)
router.get('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (isActive) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all agents (for assignment)
router.get('/agents', auth, async (req, res) => {
  try {
    const agents = await User.find({ 
      role: 'agent', 
      isActive: true 
    }).select('name email phone');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password, role, phone });
    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, phone, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deactivate user
router.patch('/:id/deactivate', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Activate user
router.patch('/:id/activate', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get agent performance
router.get('/performance/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get lead count
    const Lead = (await import('../models/Lead.js')).default;
    const leadCount = await Lead.countDocuments({ assignedTo: req.params.id });

    // Get deal count
    const Deal = (await import('../models/Deal.js')).default;
    const dealCount = await Deal.countDocuments({ 
      assignedTo: req.params.id,
      stage: 'closed'
    });

    // Get total commission
    const deals = await Deal.find({ 
      assignedTo: req.params.id,
      stage: 'closed'
    });
    const totalCommission = deals.reduce((sum, deal) => sum + (deal.commission?.amount || 0), 0);

    res.json({
      user,
      performance: {
        totalLeads: leadCount,
        closedDeals: dealCount,
        totalCommission
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;