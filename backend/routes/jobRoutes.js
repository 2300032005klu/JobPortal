import express from 'express';
import {
  getJobs,
  getJobById,
  getFeaturedJobs,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
  isJobSaved,
} from '../controllers/savedJobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/my-jobs', protect, authorize('RECRUITER'), getMyJobs);
router.get('/my', protect, authorize('RECRUITER'), getMyJobs);

// Candidate Saved Jobs (wishlist)
router.post('/:id/save', protect, authorize('CANDIDATE'), saveJob);
router.delete('/:id/save', protect, authorize('CANDIDATE'), unsaveJob);
router.get('/saved', protect, authorize('CANDIDATE'), getSavedJobs);
router.get('/:id/saved', protect, authorize('CANDIDATE'), isJobSaved);

router.get('/:id', getJobById);
router.post('/', protect, authorize('RECRUITER'), createJob);
router.put('/:id', protect, authorize('RECRUITER'), updateJob);
router.delete('/:id', protect, authorize('RECRUITER'), deleteJob);

export default router;
