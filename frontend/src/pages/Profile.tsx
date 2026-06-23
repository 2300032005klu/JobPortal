import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, FileText, Save, X, Edit } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    skills: '',
    experience: '',
    resume_url: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        skills: (user.skills || []).join(', '),
        experience: user.experience || '',
        resume_url: user.resume_url || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: profile.experience,
        resume_url: profile.resume_url,
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    if (user) {
                      setProfile({
                        name: user.name || '',
                        email: user.email || '',
                        skills: (user.skills || []).join(', '),
                        experience: user.experience || '',
                        resume_url: user.resume_url || '',
                      });
                    }
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                {user?.role}
              </span>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  className="input-field"
                  placeholder="React, Node.js, Python..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <textarea
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  className="input-field"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                <input
                  type="url"
                  value={profile.resume_url}
                  onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
    </div>
  );
};

export default Profile;
