import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';

const typeIcons = {
  PostLike: '❤️',
  PostComment: '💬',
  EventRsvp: '📅',
  BirthdayWish: '🎂',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const { data } = await apiClient.get('/notifications');
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await apiClient.put(`/notifications/${notification.id}/read`);
      window.dispatchEvent(new Event('notificationsChanged'));
    }

    // Type ke hisaab se sahi page pe le jao
    if (notification.type === 'PostLike' || notification.type === 'PostComment') {
      navigate('/memories');
    } else if (notification.type === 'EventRsvp') {
      navigate('/events');
    } else {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    await apiClient.put('/notifications/read-all');
    window.dispatchEvent(new Event('notificationsChanged'));
    fetchNotifications();
  };

  if (loading) return <p className="text-gray-500">Loading notifications...</p>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🔔 Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="text-sm text-brand-600 font-medium">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-8 text-center text-gray-400">
          No notifications yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm divide-y divide-gray-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                !n.isRead ? 'bg-brand-50' : ''
              }`}
            >
              <span className="text-xl">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && <span className="w-1 h-2 rounded-full bg-brand-600 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}