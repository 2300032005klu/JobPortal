import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, skills, experience, resumeUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.skills = skills || user.skills;
    user.experience = experience || user.experience;
    user.resumeUrl = resumeUrl || user.resumeUrl;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      experience: user.experience,
      resumeUrl: user.resumeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: 'RECRUITER' });
    const totalCandidates = await User.countDocuments({ role: 'CANDIDATE' });

    res.json({
      totalJobs,
      totalApplications,
      totalRecruiters,
      totalCandidates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
