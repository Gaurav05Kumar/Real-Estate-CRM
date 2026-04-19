import express from 'express';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  toggleUserStatus, 
  deleteUser, 
  getUserStats 
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', auth, authorize('admin', 'manager'), getAllUsers);
router.get('/agents', auth, async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent', isActive: true }).select('name email phone');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:id', auth, getUserById);
router.post('/', auth, authorize('admin'), createUser);
router.put('/:id', auth, authorize('admin'), updateUser);
router.patch('/:id/deactivate', auth, authorize('admin'), toggleUserStatus);
router.patch('/:id/activate', auth, authorize('admin'), toggleUserStatus);
router.delete('/:id', auth, authorize('admin'), deleteUser);
router.get('/stats/summary', auth, authorize('admin', 'manager'), getUserStats);

export default router;