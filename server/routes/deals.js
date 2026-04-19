import express from 'express';
import Deal from '../models/Deal.js';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/deals');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only document files are allowed'));
  }
});

const router = express.Router();

// Get all deals (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { stage, assignedTo, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (stage) query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Agents can only see their deals
    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    const deals = await Deal.find(query)
      .populate('property', 'title price location images')
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Deal.countDocuments(query);

    res.json({
      deals,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single deal
router.get('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('property')
      .populate('client')
      .populate('assignedTo', 'name email phone')
      .populate('documents.uploadedBy', 'name')
      .populate('notes.addedBy', 'name')
      .populate('activities.addedBy', 'name')
      .populate('stageHistory.changedBy', 'name');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create deal
router.post('/', auth, async (req, res) => {
  try {
    const deal = new Deal(req.body);
    
    // Calculate commission
    if (req.body.dealValue && req.body.commission?.percentage) {
      deal.commission.amount = (req.body.dealValue * req.body.commission.percentage) / 100;
    }
    
    // Add initial stage history
    deal.stageHistory.push({
      stage: deal.stage,
      changedBy: req.user._id
    });
    
    if (req.user.role !== 'admin') {
      deal.assignedTo = req.user._id;
    }
    
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update deal
router.put('/:id', auth, async (req, res) => {
  try {
    const dealData = { ...req.body };
    
    // Recalculate commission if needed
    if (req.body.dealValue && req.body.commission?.percentage) {
      dealData.commission = {
        percentage: req.body.commission.percentage,
        amount: (req.body.dealValue * req.body.commission.percentage) / 100
      };
    }

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      dealData,
      { new: true, runValidators: true }
    ).populate('property', 'title price')
     .populate('client', 'name email');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update deal stage
router.patch('/:id/stage', auth, async (req, res) => {
  try {
    const { stage, reason } = req.body;
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Add stage history
    deal.stageHistory.push({
      stage,
      changedBy: req.user._id
    });

    // Add reason if deal is lost or closed
    if (stage === 'lost' && reason) {
      deal.lostReason = reason;
    }
    if (stage === 'closed' && reason) {
      deal.closedReason = reason;
    }

    deal.stage = stage;
    
    // If closed, set closing date and update commission
    if (stage === 'closed') {
      deal.closingDate = new Date();
      if (deal.dealValue && deal.commission?.percentage) {
        deal.commission.amount = (deal.dealValue * deal.commission.percentage) / 100;
      }
    }

    await deal.save();
    
    const updatedDeal = await Deal.findById(req.params.id)
      .populate('property', 'title price')
      .populate('client', 'name email')
      .populate('assignedTo', 'name');

    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload document
router.post('/:id/documents', auth, upload.single('file'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.documents.push({
      name: req.file.originalname,
      url: `/uploads/deals/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    await deal.save();
    
    const updatedDeal = await Deal.findById(req.params.id)
      .populate('documents.uploadedBy', 'name');

    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add note
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.notes.push({
      text,
      addedBy: req.user._id
    });

    await deal.save();
    
    const updatedDeal = await Deal.findById(req.params.id)
      .populate('notes.addedBy', 'name');

    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add activity
router.post('/:id/activities', auth, async (req, res) => {
  try {
    const { type, description } = req.body;
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.activities.push({
      type,
      description,
      addedBy: req.user._id
    });

    await deal.save();
    
    const updatedDeal = await Deal.findById(req.params.id)
      .populate('activities.addedBy', 'name');

    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete deal
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get deal statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$dealValue' },
          totalCommission: { $sum: '$commission.amount' }
        }
      }
    ]);

    const total = await Deal.countDocuments();
    const closed = await Deal.countDocuments({ stage: 'closed' });
    
    const totalValue = await Deal.aggregate([
      { $match: { stage: 'closed' } },
      { $group: { _id: null, total: { $sum: '$dealValue' } } }
    ]);

    res.json({
      total,
      closed,
      byStage: stats,
      totalClosedValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;