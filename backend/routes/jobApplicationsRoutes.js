import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

import { getJobApplications } from '../controllers/applicationController.js';

const router = express.Router();

// Alias route requested by spec
router.get('/:jobId/applications', protect, authorize('RECRUITER'), getJobApplications);

export default router;


