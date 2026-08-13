import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-25" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-15" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 text-white">
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Cousin Connect
          </span>
        </Link>

        <div className="bg-dark-700/80 backdrop-blur-xl border border-brand-500/20 rounded-2xl p-8 shadow-2xl shadow-brand-900/30">
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Login to Cousin Connect</p>

          {error && (
            <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 shadow-lg shadow-brand-900/40"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 font-medium hover:text-brand-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}