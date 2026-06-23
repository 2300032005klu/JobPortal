import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../services/applicationService';
import { updateProfile } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { FileText, Edit, Save, X, User } from 'lucide-react';
import type { Application } from '../services/applicationService';

const CandidateDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    skills: '',
    experience: '',
    resume_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const appsData = await getMyApplications();
      setApplications(appsData);
      if (user) {
        setProfileData({
          name: user.name || '',
          skills: (user.skills || []).join(', '),
          experience: user.experience || '',
resume_url: (user as any).resume_url || '',

        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profileData.name,
        skills: profileData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: profileData.experience,
        resume_url: profileData.resume_url,
      });
      await refreshUser();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Candidate Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(false)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-primary"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Skills (comma separated)</label>
                    <input
                      value={profileData.skills}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                      className="input-field mt-1"
                      placeholder="React, Node.js, Python..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <textarea
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      className="input-field mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resume URL</label>
                    <input
                      type="url"
                      value={profileData.resume_url}
                      onChange={(e) => setProfileData({ ...profileData, resume_url: e.target.value })}
                      className="input-field mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(user?.skills || []).length > 0 ? (
                        user?.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No skills added</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {user?.experience || 'No experience added'}
                    </p>
                  </div>
                  {user?.resume_url && (
                    <a
                      href={user.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h2>

              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  message="Start applying to jobs and track your applications here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Job Title</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Applied Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {app.jobs?.title || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {app.jobs?.profiles?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
{(app as any).created_at ? new Date((app as any).created_at).toLocaleDateString() : (app as any).createdAt ? new Date((app as any).createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
<StatusBadge status={app.status || 'Applied'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
