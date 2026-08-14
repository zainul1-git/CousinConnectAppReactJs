import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7168/api').replace('/api', '');

export default function Profile() {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get('/profile/me').then(({ data }) => {
      setProfile(data);
      setFullName(data.fullName);
      setBio(data.bio || '');
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const formData = new FormData();
    formData.append('FullName', fullName);
    formData.append('Bio', bio);
    if (avatarFile) formData.append('avatar', avatarFile);

    const { data } = await apiClient.put('/profile', formData);
    setProfile(data);

    // AuthContext aur localStorage bhi update kar do taake Navbar/naam sync rahe
    localStorage.setItem('cc_user', JSON.stringify(data));
    setUser(data);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return <p className="text-gray-500">Loading profile...</p>;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 My Profile</h1>

      <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-fullbg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
            {profile.avatarUrl ? (
              <img src={`${API_ORIGIN}${profile.avatarUrl}`} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.fullName.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the family about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Change Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="text-sm text-gray-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm text-green-600">✓ Saved!</span>}
          </div>

          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
            🏆 {profile.points} points earned
          </div>
        </form>
      </div>
    </div>
  );
}