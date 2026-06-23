import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import type { Job } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { isJobSaved, saveJob, unsaveJob } from '../services/savedJobService';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user } = useAuth();
  const jobId = job._id ?? job.id!;

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user || user.role !== 'CANDIDATE') return;
      try {
        const res = await isJobSaved(jobId as string);
        setSaved(res.saved);
      } catch {
        setSaved(false);
      }
    };
    run();
  }, [user?.role, jobId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || user.role !== 'CANDIDATE') return;

    setSaving(true);
    try {
      if (saved) {
        await unsaveJob(jobId as string);
        setSaved(false);
      } else {
        await saveJob(jobId as string);
        setSaved(true);
      }
    } catch (err) {
      // keep UI state conservative
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      to={`/jobs/${jobId}`}
      className="card hover:shadow-md transition-shadow duration-200 block"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.profiles?.name || 'Unknown Company'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSave}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label={saved ? 'Unsave job' : 'Save job'}
            title={saved ? 'Saved' : 'Save'}
            disabled={saving}
          >
            {saved ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400" />
            )}
          </button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {job.type}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          {job.salary}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {job.type}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
        <span className="text-gray-400 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Deadline:{' '}
          {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
        </span>
        <span className="text-primary font-medium">View Details &rarr;</span>
      </div>
    </Link>
  );
};

export default JobCard;

