import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

export default function Cousins() {
  const [cousins, setCousins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCousins = async () => {
      try {
        const { data } = await apiClient.get('/cousins');
        setCousins(data);
      } catch (err) {
        setError('Failed to load cousins. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCousins();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading cousins...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">👥 Cousins</h1>
      <p className="text-gray-500 mb-6">{cousins.length} family members</p>

      {cousins.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No cousins have joined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cousins.map((cousin) => (
            <div
              key={cousin.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg overflow-hidden">
                  {cousin.avatarUrl ? (
                    <img
                      src={cousin.avatarUrl}
                      alt={cousin.fullName}
                      className="w-full h-full object-cover"
                    />
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
              <div>
                <p className="font-semibold text-gray-800">{cousin.fullName}</p>
                <p className="text-sm text-gray-500">
                  {cousin.isOnline ? 'Online' : 'Offline'}
                </p>
                {cousin.bio && (
                  <p className="text-xs text-gray-400 mt-1">{cousin.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}