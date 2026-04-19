import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { 
  getAllLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  updateLeadStatus, 
  assignLead, 
  addNote, 
  deleteLead, 
  getLeadStats 
} from '../controllers/leadController.js';

const router = express.Router();

router.get('/', auth, getAllLeads);
router.get('/:id', auth, getLeadById);
router.post('/', auth, createLead);
router.put('/:id', auth, updateLead);
router.patch('/:id/status', auth, updateLeadStatus);
router.patch('/:id/assign', auth, authorize('admin', 'manager'), assignLead);
router.post('/:id/notes', auth, addNote);
router.delete('/:id', auth, authorize('admin', 'manager'), deleteLead);
router.get('/stats/summary', auth, getLeadStats);

export default router;