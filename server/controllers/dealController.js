import Deal from '../models/Deal.js';

export const getAllDeals = async (req, res) => {
  try {
    const { status, stage, assignedTo, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (stage) query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }

    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    const deals = await Deal.find(query)
      .populate('property', 'title address price')
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
};

export const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('property', 'title address price images')
      .populate('client', 'name email phone address')
      .populate('assignedTo', 'name email phone')
      .populate('notes.addedBy', 'name')
      .populate('activities.addedBy', 'name');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const deal = new Deal(req.body);
    
    // Calculate commission
    if (req.body.value && req.body.commission?.percentage) {
      deal.commission = {
        percentage: req.body.commission.percentage,
        amount: (req.body.value * req.body.commission.percentage) / 100
      };
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
};

export const updateDeal = async (req, res) => {
  try {
    const dealData = { ...req.body };
    
    // Recalculate commission if needed
    if (req.body.value && req.body.commission?.percentage) {
      dealData.commission = {
        percentage: req.body.commission.percentage,
        amount: (req.body.value * req.body.commission.percentage) / 100
      };
    }

    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      dealData,
      { new: true, runValidators: true }
    )
      .populate('property', 'title address price')
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDealStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { stage },
      { new: true }
    )
      .populate('property', 'title address price')
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addNote = async (req, res) => {
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
};

export const addActivity = async (req, res) => {
  try {
    const { type, description, date } = req.body;
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.activities.push({
      type,
      description,
      date,
      addedBy: req.user._id
    });

    await deal.save();
    
    const updatedDeal = await Deal.findById(req.params.id)
      .populate('activities.addedBy', 'name');

    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDealStats = async (req, res) => {
  try {
    const stats = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    const statusStats = await Deal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    const total = await Deal.countDocuments();
    const totalValue = await Deal.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);

    const wonDeals = await Deal.aggregate([
      { $match: { status: 'won' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total,
      totalValue: totalValue[0]?.total || 0,
      wonValue: wonDeals[0]?.total || 0,
      wonCount: wonDeals[0]?.count || 0,
      byStage: stats,
      byStatus: statusStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};