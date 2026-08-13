import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
];

export default function AppLayout() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - desktop pe dikhega */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 p-4">
        <h1 className="text-xl font-bold text-indigo-600 mb-6 px-2">Cousin Connect</h1>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Mobile top bar - sirf mobile pe dikhega */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-indigo-600">Cousin Connect</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu - jab hamburger click ho */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-lg">
          <nav className="flex flex-col p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-gray-600'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600"
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