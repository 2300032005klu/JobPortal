import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyJobs, deleteJob } from '../services/jobService';
import { getJobApplications, updateApplicationStatus } from '../services/applicationService';
import { getRecruiterApplications } from '../services/recruiterService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Edit, Trash2, Users, Eye } from 'lucide-react';

import type { Job } from '../services/jobService';
import type { Application } from '../services/applicationService';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getResumeHref = (value?: string) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const clean = value.replace(/^\/?uploads\/?/, '').replace(/^\/+/, '');
  return `${API_ORIGIN}/uploads/${clean}`;
};

const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);         // all recruiter apps (dashboard-level)
  const [modalApplications, setModalApplications] = useState<Application[]>([]); // FIX: separate state for modal
  const [loading, setLoading] = useState(true);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const getJobId = (job: Job) => job._id ?? job.id;

  useEffect(() => {
    fetchJobs();
    fetchRecruiterApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiterApplications = async () => {
    try {
      setError('');
      const data = await getRecruiterApplications();
      setApplications(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load applications.');
      setApplications([]);
    }
  };

  // FIX: now writes to modalApplications, not applications
  const viewApplicants = async (jobId: string) => {
    setModalApplications([]); // clear stale data before fetching
    setApplicantsModalOpen(true);
    try {
      const data = await getJobApplications(jobId);
      setModalApplications(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load applicants.');
    }
  };

  // FIX: update both states so UI stays consistent
  const handleStatusChange = async (appId: string, status: string) => {
    try {
      await updateApplicationStatus(appId, status);

      const updater = (prev: Application[]) =>
        prev.map((app) => {
          const thisId = (app as any)?._id ?? app.id;
          return thisId === appId
            ? { ...app, status: status as Application['status'] }
            : app;
        });

      setApplications(updater);
      setModalApplications(updater);
    } catch (err) {
      console.error(err);
      setError('Failed to update application status.');
    }
  };

  // FIX: use getJobId to correctly match _id from MongoDB
  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => getJobId(j) !== jobId)); // was: j.id !== jobId
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <button
            onClick={() => navigate('/post-job')}
            className="btn-primary flex items-center gap-2"
          >
            Post New Job
          </button>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>

          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              message="Applications submitted by candidates will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Candidate</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Job</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Skills</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => {
                    const appId = (app as any)._id ?? app.id;
                    const candidate = (app as any).candidateId ?? app.candidateId;
                    const job = (app as any).jobId ?? app.jobId;
                    const profile = app.profiles ?? (candidate as any);
                    const resumeHref = getResumeHref(
                      (app as any).resumeFile || profile?.resumeFile || profile?.resumeUrl
                    );

                    return (
                      <tr key={appId} className="border-b border-gray-50">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">
                            {candidate?.name ?? profile?.name ?? 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {candidate?.email ?? profile?.email ?? ''}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {job?.title ?? app.jobs?.title ?? 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {((candidate?.skills ?? profile?.skills ?? []) as string[])
                              .slice(0, 3)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{app.status || 'Applied'}</td>
                        <td className="py-3 px-4">
                          {resumeHref ? (
                            <a
                              href={resumeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Posted Jobs</h2>

          {jobs.length === 0 ? (
            <EmptyState
              title="No jobs posted yet"
              message="Post your first job listing to start receiving applications."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Deadline</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={getJobId(job)} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{job.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{job.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{job.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewApplicants(getJobId(job)!)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-primary"
                            title="View Applicants"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/jobs/${getJobId(job)!}`)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                            title="View Job"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/post-job?edit=${getJobId(job)!}`)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(getJobId(job) ?? null)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Applicants Modal — FIX: uses modalApplications, not applications */}
      <Modal
        isOpen={applicantsModalOpen}
        onClose={() => {
          setApplicantsModalOpen(false);
          setModalApplications([]); // clean up on close
        }}
        title="Job Applicants"
        maxWidth="max-w-4xl"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {modalApplications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            message="No candidates have applied for this position yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Candidate</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Skills</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Applied</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Resume</th>
                </tr>
              </thead>
              <tbody>
                {modalApplications.map((app) => {
                  const appId = (app as any)._id ?? app.id;
                  const candidate = (app as any).candidateId ?? app.candidateId;
                  const profile = app.profiles ?? (candidate as any);
                  const resumeHref = getResumeHref(
                    (app as any).resumeFile || profile?.resumeFile || profile?.resumeUrl
                  );

                  return (
                    <tr key={appId} className="border-b border-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {candidate?.name ?? profile?.name ?? 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {candidate?.email ?? profile?.email ?? ''}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {((candidate?.skills ?? profile?.skills ?? []) as string[])
                            .slice(0, 3)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-500">
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : app.createdAt
                            ? new Date(app.createdAt).toLocaleDateString()
                            : 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={app.status || 'Applied'}
                          onChange={(e) => handleStatusChange(appId, e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        {resumeHref ? (
                          <a
                            href={resumeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this job? This action cannot be undone and all applications will be removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
