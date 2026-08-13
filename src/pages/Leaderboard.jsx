import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/leaderboard').then(({ data }) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-500">Loading leaderboard...</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">🏆 Leaderboard</h1>
      <p className="text-gray-500 mb-6">Who's leading the family game?</p>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {entries.map((entry) => (
          <div key={entry.userId} className="flex items-center gap-4 px-5 py-4">
            <span className="text-xl w-8 text-center">
              {medals[entry.rank - 1] || entry.rank}
            </span>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
              {entry.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 font-medium text-gray-800">{entry.fullName}</span>
            <span className="text-gray-500 font-semibold">{entry.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}