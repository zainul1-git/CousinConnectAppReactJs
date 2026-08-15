import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../lib/apiClient';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/chat', label: 'Chat', icon: '💬' },
  { to: '/cousins', label: 'Cousins', icon: '👥' },
  { to: '/memories', label: 'Memories', icon: '📸' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/polls', label: 'Polls', icon: '🗳️' },
  { to: '/funzone', label: 'Fun Zone', icon: '🎮' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/group-chat', label: 'Family Group', icon: '👨‍👩‍👧‍👦' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      apiClient.get('/notifications').then(({ data }) => {
        setUnreadCount(data.filter((n) => !n.isRead).length);
      });
    };
    fetchUnread();
    window.addEventListener('notificationsChanged', fetchUnread);
    const interval = setInterval(fetchUnread, 15000);
    return () => {
      window.removeEventListener('notificationsChanged', fetchUnread);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - desktop pe dikhega */}
      <aside className="hidden md:flex md:flex-col w-64 bg-dark-800 border-r border-dark-600 p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <span className="text-xl">👨‍👩‍👧‍👦</span>
          <h1
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Cousin Connect
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-dark-700 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                    : 'text-gray-400 hover:bg-dark-600 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Mobile top bar - sirf mobile pe dikhega */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-dark-800 border-b border-dark-600 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">👨‍👩‍👧‍👦</span>
          <h1 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Cousin Connect
          </h1>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl relative text-white">
          {mobileOpen ? '✕' : '☰'}
          {!mobileOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile menu - jab hamburger click ho */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-10 bg-dark-800 border-b border-dark-600 shadow-lg">
          <nav className="flex flex-col p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-600 text-white' : 'text-gray-400'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
                {item.to === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400"
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      )}

      {/* Yahan actual page content aayega (Dashboard, Chat, wagera) */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}