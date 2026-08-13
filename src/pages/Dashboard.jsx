import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard').then(({ data }) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  const handleBirthdayWish = async (userId) => {
    await apiClient.post(`/notifications/birthday-wish/${userId}`);
    alert('Birthday wish sent! 🎉');
  };

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;

  const cardClass = 'bg-white rounded-2xl border border-brand-100 p-5 shadow-sm hover:shadow-md transition-shadow';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        🏠 Welcome back, {data.welcomeName}!
      </h1>
      <p className="text-gray-500 mb-6">
        {data.onlineCousinsCount} of {data.totalCousinsCount} cousins online right now
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={cardClass}>
          <h2 className="font-semibold text-gray-800 mb-3">📅 Upcoming Events</h2>
          {data.upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming events</p>
          ) : (
            <ul className="space-y-2">
              {data.upcomingEvents.map((e) => (
                <li key={e.id} className="text-sm text-gray-600 flex justify-between">
                  <span>{e.title}</span>
                  <span className="text-gray-400">{new Date(e.eventDate).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/events" className="text-xs text-brand-600 font-medium mt-3 inline-block hover:text-brand-700">
            View all →
          </Link>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-gray-800 mb-3">🎂 Upcoming Birthdays</h2>
          {data.upcomingBirthdays.length === 0 ? (
            <p className="text-sm text-gray-400">No birthdays coming up</p>
          ) : (
            <ul className="space-y-2">
              {data.upcomingBirthdays.map((b) => (
                <li key={b.userId} className="text-sm text-gray-600 flex items-center justify-between">
                  <span>{b.fullName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {b.daysUntil === 0 ? '🎉 Today!' : `in ${b.daysUntil} days`}
                    </span>
                    <button
                      onClick={() => handleBirthdayWish(b.userId)}
                      className="text-xs text-brand-600 font-medium hover:underline"
                    >
                      Send wish
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-gray-800 mb-3">📸 Recent Memories</h2>
          {data.recentPosts.length === 0 ? (
            <p className="text-sm text-gray-400">No memories shared yet</p>
          ) : (
            <ul className="space-y-2">
              {data.recentPosts.map((p) => (
                <li key={p.id} className="text-sm text-gray-600">
                  <span className="font-medium">{p.userName}</span>
                  {p.content && `: ${p.content.slice(0, 40)}${p.content.length > 40 ? '...' : ''}`}
                </li>
              ))}
            </ul>
          )}
          <Link to="/memories" className="text-xs text-brand-600 font-medium mt-3 inline-block hover:text-brand-700">
            View all →
          </Link>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-gray-800 mb-3">🏆 Top Leaderboard</h2>
          {data.topLeaders.length === 0 ? (
            <p className="text-sm text-gray-400">No points yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topLeaders.map((l, i) => (
                <li key={l.userId} className="text-sm text-gray-600 flex justify-between">
                  <span>{['🥇', '🥈', '🥉'][i] || `${i + 1}.`} {l.fullName}</span>
                  <span className="text-gray-400">{l.points} pts</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/leaderboard" className="text-xs text-brand-600 font-medium mt-3 inline-block hover:text-brand-700">
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}