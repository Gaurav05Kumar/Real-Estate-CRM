import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Deal from '../models/Deal.js';
import { 
  getAllDeals, 
  getDealById, 
  createDeal, 
  updateDeal, 
  updateDealStage, 
  addNote, 
  addActivity, 
  deleteDeal, 
  getDealStats 
} from '../controllers/dealController.js';

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
  limits: { fileSize: 10 * 1024 * 1024 },
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

router.get('/', auth, getAllDeals);
router.get('/:id', auth, getDealById);
router.post('/', auth, createDeal);
router.put('/:id', auth, updateDeal);
router.patch('/:id/stage', auth, updateDealStage);
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
router.post('/:id/notes', auth, addNote);
router.post('/:id/activities', auth, addActivity);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteDeal);
router.get('/stats/summary', auth, getDealStats);

export default router;