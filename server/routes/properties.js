import express from 'express';
import Property from '../models/Property.js';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/properties');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

const router = express.Router();

// Get all properties (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      propertyType, 
      listingType, 
      status, 
      city, 
      minPrice, 
      maxPrice, 
      bedrooms,
      search,
      featured,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (status) query.status = status;
    if (city) query['location.city'] = city;
    if (bedrooms) query.bedrooms = bedrooms;
    if (featured) query.featured = featured === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const properties = await Property.find(query)
      .populate('listedBy', 'name')
      .populate('assignedAgent', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single property
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('listedBy', 'name')
      .populate('assignedAgent', 'name phone email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create property
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const propertyData = { ...req.body };
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map((file, index) => ({
        url: `/uploads/properties/${file.filename}`,
        isPrimary: index === 0
      }));
    }

    // Set listedBy
    propertyData.listedBy = req.user._id;
    if (req.user.role === 'agent') {
      propertyData.assignedAgent = req.user._id;
    }

    const property = new Property(propertyData);
    await property.save();
    
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update property
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const propertyData = { ...req.body };
    
    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/properties/${file.filename}`,
        isPrimary: false
      }));
      
      // Get existing images
      const existingProperty = await Property.findById(req.params.id);
      propertyData.images = [...(existingProperty.images || []), ...newImages];
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      propertyData,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete property
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle featured
router.patch('/:id/featured', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.featured = !property.featured;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get property statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Property.aggregate([
      {
        $group: {
          _id: { status: '$status', listingType: '$listingType' },
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Property.countDocuments();
    const featured = await Property.countDocuments({ featured: true });

    res.json({
      total,
      featured,
      byStatusAndType: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unique cities for filters
router.get('/filters/cities', auth, async (req, res) => {
  try {
    const cities = await Property.distinct('location.city');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;