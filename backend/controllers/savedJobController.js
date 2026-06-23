import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';

export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const existing = await SavedJob.findOne({
      userId: req.user._id,
      jobId,
    });

    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    const saved = await SavedJob.create({
      userId: req.user._id,
      jobId,
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const result = await SavedJob.deleteOne({
      userId: req.user._id,
      jobId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job unsaved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'jobId',
        populate: { path: 'postedBy', select: 'name email' },
      });

    // Normalize for frontend convenience
    const jobs = savedJobs.map((s) => s.jobId);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const isJobSaved = async (req, res) => {
  try {
    const jobId = req.params.id;

    const saved = await SavedJob.exists({
      userId: req.user._id,
      jobId,
    });

    res.json({ saved: !!saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

