import express from 'express';
import { auth } from '../middleware/auth.js';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

export default router;