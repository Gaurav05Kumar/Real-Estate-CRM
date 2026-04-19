import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  getAllProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  updatePropertyStatus, 
  deleteProperty, 
  getPropertyStats 
} from '../controllers/propertyController.js';

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
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.get('/', auth, getAllProperties);
router.get('/:id', auth, getPropertyById);
router.post('/', auth, upload.array('images', 10), createProperty);
router.put('/:id', auth, upload.array('images', 10), updateProperty);

router.patch('/:id/status', auth, updatePropertyStatus);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteProperty);
router.get('/stats/summary', auth, getPropertyStats);

export default router;