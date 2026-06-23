import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, Building2, ArrowRight } from 'lucide-react';
import { getFeaturedJobs } from '../services/jobService';
import { getStats } from '../services/userService';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Job } from '../services/jobService';


interface Stats {
  totalJobs: number;
  totalRecruiters: number;
  totalCandidates: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({ totalJobs: 0, totalRecruiters: 0, totalCandidates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, statsData] = await Promise.all([
          getFeaturedJobs(),
          getStats(),
        ]);
        setFeaturedJobs(jobsData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Your <span className="text-primary">Dream Job</span> Today
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              Connect with top employers and discover opportunities that match your skills and aspirations.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title or location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3 flex items-center gap-2">
                Search
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                <p className="text-sm text-gray-500">Active Jobs</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecruiters}</p>
                <p className="text-sm text-gray-500">Companies Hiring</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</p>
                <p className="text-sm text-gray-500">Candidates Registered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
              <p className="text-gray-500 mt-1">Hand-picked opportunities for you</p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
