import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
  if (!isPdf) {
    return cb(new Error('Only PDF resumes are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

const uploadResumeFile = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Resume must be 5MB or smaller' });
    }

    return res.status(400).json({ message: err.message || 'Resume upload failed' });
  });
};

// POST /api/upload/resume (multipart/form-data, field: resume)
router.post('/resume', protect, authorize('CANDIDATE'), uploadResumeFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // File served by backend: /uploads/... (see server.js)
    const relativePath = path.posix.join('resumes', req.file.filename);
    const publicPath = `${req.protocol}://${req.get('host')}/uploads/${relativePath}`;

    res.status(201).json({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: relativePath,
      uploadedAt: req.file.path ? new Date().toISOString() : new Date().toISOString(),
      url: publicPath,
    });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Upload failed' });
  }
});

export default router;

