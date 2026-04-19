import express from 'express';
import Client from '../models/Client.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all clients (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, assignedTo, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Agents can only see their clients
    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    const clients = await Client.find(query)
      .populate('assignedTo', 'name email')
      .populate('visitedProperties.property', 'title price location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Client.countDocuments(query);

    res.json({
      clients,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('visitedProperties.property')
      .populate('interactions.addedBy', 'name');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create client
router.post('/', auth, async (req, res) => {
  try {
    const client = new Client(req.body);
    if (req.user.role !== 'admin') {
      client.assignedTo = req.user._id;
    }
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add interaction
router.post('/:id/interactions', auth, async (req, res) => {
  try {
    const { type, description } = req.body;
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.interactions.push({
      type,
      description,
      addedBy: req.user._id
    });

    await client.save();
    
    const updatedClient = await Client.findById(req.params.id)
      .populate('interactions.addedBy', 'name');

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add visited property
router.post('/:id/visited', auth, async (req, res) => {
  try {
    const { propertyId, notes } = req.body;
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.visitedProperties.push({
      property: propertyId,
      notes
    });

    await client.save();
    
    const updatedClient = await Client.findById(req.params.id)
      .populate('visitedProperties.property', 'title price location');

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete client
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get client statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Client.countDocuments();
    const active = await Client.countDocuments({ status: 'active' });

    res.json({
      total,
      active,
      byType: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;