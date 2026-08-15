import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';

export default function Cousins() {
  const [cousins, setCousins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7168/api').replace('/api', '');
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get('/cousins')
      .then(({ data }) => setCousins(data))
      .catch(() => setError('Failed to load cousins. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading cousins...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        👥 Cousins
      </h1>
      <p className="text-gray-500 mb-6">{cousins.length} family members</p>

      {cousins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center text-gray-400">
          No cousins have joined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cousins.map((cousin) => (
            <div
              key={cousin.id}
              className="bg-white rounded-2xl border border-brand-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {cousin.avatarUrl ? (
                    // <img src={cousin.avatarUrl} alt={cousin.fullName} className="w-full h-full object-cover" />
                    <img src={`${API_ORIGIN}${cousin.avatarUrl}`} alt={cousin.fullName} className="w-full h-full object-cover" />
                  ) : (
                    cousin.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    cousin.isOnline ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{cousin.fullName}</p>
                <p className="text-sm text-gray-500">{cousin.isOnline ? 'Online' : 'Offline'}</p>
                {cousin.bio && <p className="text-xs text-gray-400 mt-1">{cousin.bio}</p>}
              </div>
              <button
                onClick={() => navigate(`/chat?with=${cousin.id}`)}
                className="text-brand-600 text-sm font-medium hover:underline shrink-0"
              >
                💬 Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}