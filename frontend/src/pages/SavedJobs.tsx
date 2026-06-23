import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import type { Job } from '../services/jobService';
import { getSavedJobs } from '../services/savedJobService';
import { useAuth } from '../context/AuthContext';

const SavedJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await getSavedJobs();
      setJobs(data);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      fetchSaved();
    }
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" />
            Saved Jobs
          </h1>
          <p className="text-sm text-gray-500">
            Your job wishlist. Save roles to view them here.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No saved jobs"
            message="Browse jobs and click the bookmark icon to save opportunities."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id ?? job.id!} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;

