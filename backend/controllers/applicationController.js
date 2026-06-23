import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { sendEmail } from '../utils/emailService.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeFile } = req.body;


    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await Application.findOne({
      candidateId: req.user._id,
      jobId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      candidateId: req.user._id,
      recruiterId: job.postedBy,
      jobId,
      coverLetter: coverLetter || '',
      resumeFile: resumeFile || '',

      appliedAt: new Date(),
    });

    await application.populate('candidateId', 'name email');
    await application.populate('jobId', 'title');
    await application.populate('recruiterId', 'name email');

    sendEmail({
      to: application.recruiterId?.email,
      subject: `New application for ${application.jobId?.title || 'your job'}`,
      text: `${application.candidateId?.name || 'A candidate'} applied for ${application.jobId?.title || 'your job'}.`,
    }).catch((emailError) => console.warn('[email] application notification failed:', emailError.message));

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'postedBy', select: 'name email' },
      })
      .populate('candidateId', 'name email skills experience resumeUrl')
      .populate('jobId', 'title company location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const checkApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      candidateId: req.user._id,
      jobId: req.params.jobId,
    });

    res.json({ applied: !!application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('candidateId', 'name email skills experience resumeUrl')
      .populate('jobId', 'title company location')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecruiterApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).select('_id postedBy');
    const jobIds = jobs.map((j) => j._id);

    // Backfill older application docs for this recruiter only
    // - recruiterId missing => set from job.postedBy
    // - appliedAt missing => set from createdAt (or now)
    if (jobIds.length > 0) {
      await Application.updateMany(
        { jobId: { $in: jobIds }, recruiterId: { $exists: false } },
        { $set: { recruiterId: req.user._id } }
      );

      await Application.updateMany(
        { jobId: { $in: jobIds }, appliedAt: { $exists: false } },
        { $set: { appliedAt: new Date() } }
      );
    }

    const applications = await Application.find({
      $or: [
        { recruiterId: req.user._id },
        ...(jobIds.length ? [{ jobId: { $in: jobIds } }] : []),
      ],
    })
      .populate('candidateId', 'name email skills experience resumeUrl')
      .populate('jobId', 'title company location')
      .sort({ appliedAt: -1, createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Rejected',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('candidateId');


    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    await application.populate('candidateId', 'name email skills experience resumeUrl');
    await application.populate('jobId', 'title company location');

    sendEmail({
      to: application.candidateId?.email,
      subject: `Application status updated: ${status}`,
      text: `Your application for ${application.jobId?.title || 'a job'} is now ${status}.`,
    }).catch((emailError) => console.warn('[email] status notification failed:', emailError.message));

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
