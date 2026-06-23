import express from 'express';
import {
  applyForJob,
  getMyApplications,
  checkApplication,
  getJobApplications,
  getRecruiterApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('CANDIDATE'), applyForJob);
router.get('/my', protect, authorize('CANDIDATE'), getMyApplications);
router.get('/check/:jobId', protect, authorize('CANDIDATE'), checkApplication);
router.get('/job/:jobId', protect, authorize('RECRUITER'), getJobApplications);
router.get('/recruiter', protect, authorize('RECRUITER'), getRecruiterApplications);
router.patch('/:id/status', protect, authorize('RECRUITER'), updateApplicationStatus);


export default router;
