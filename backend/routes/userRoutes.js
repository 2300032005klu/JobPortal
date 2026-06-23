import express from 'express';
import { updateProfile, getStats } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/stats', getStats);

export default router;
