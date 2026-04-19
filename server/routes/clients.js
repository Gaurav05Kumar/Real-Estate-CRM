import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { 
  getAllClients, 
  getClientById, 
  createClient, 
  updateClient, 
  addNote, 
  deleteClient, 
  getClientStats 
} from '../controllers/clientController.js';

const router = express.Router();

router.get('/', auth, getAllClients);
router.get('/:id', auth, getClientById);
router.post('/', auth, createClient);
router.put('/:id', auth, updateClient);
router.post('/:id/notes', auth, addNote);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteClient);
router.get('/stats/summary', auth, getClientStats);

export default router;