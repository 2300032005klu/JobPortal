import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Calendar, Building2, CheckCircle } from 'lucide-react';
import { getJobById } from '../services/jobService';
import { checkApplication, applyForJob, uploadResume } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import type { Job } from '../services/jobService';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);


  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    console.log('Route param id:', id);
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const jobData = await getJobById(id!);
      console.log('Selected job id:', id);
      setJob(jobData);

      if (user?.role === 'CANDIDATE') {
        const check = await checkApplication(id!);
        setApplied(check.applied);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');

    try {
      await applyForJob({
        jobId: id!,
        coverLetter,
        resumeFile,
      });


      setApplied(true);
      setApplyModalOpen(false);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to apply');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="text-center py-12">Job not found</div>;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.profiles?.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.type}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {job.type}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
              <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">{job.salary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Job Type</p>
                    <p className="font-medium text-gray-900">{job.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Deadline</p>
{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {user?.role === 'CANDIDATE' && (
              <div className="card">
                {applied ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Already Applied</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="w-full btn-primary py-3"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Position"
      >
        {applyError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{applyError}</div>

        )}
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="input-field"
              placeholder="Tell us why you're a good fit..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              className="input-field mt-1"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.type !== 'application/pdf') {
                  setApplyError('Only PDF resumes are allowed');
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  setApplyError('Resume must be <= 5MB');
                  return;
                }

                try {
                  setUploadingResume(true);
                  setApplyError('');
                  const data = await uploadResume(file);
                  setResumeFile(data.url || data.path);

                } catch (err: any) {
                  setApplyError(err?.response?.data?.message || err.message || 'Resume upload failed');
                  setResumeFile('');
                } finally {
                  setUploadingResume(false);
                }
              }}
            />

            {resumeFile ? (
              <p className="text-xs text-primary mt-2">
                Resume uploaded ✅
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">PDF only, max 5MB</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyLoading || uploadingResume || !resumeFile}


              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {applyLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetail;
