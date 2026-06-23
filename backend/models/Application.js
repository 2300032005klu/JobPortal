import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    coverLetter: {
      type: String,
      default: '',
    },
    resumeFile: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected'],
      default: 'Applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
