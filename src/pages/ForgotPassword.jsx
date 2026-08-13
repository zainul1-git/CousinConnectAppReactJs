import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900 flex items-center justify-center px-4">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-25" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 text-white">
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Cousin Connect
          </span>
        </Link>

        <div className="bg-dark-700/80 backdrop-blur-xl border border-brand-500/20 rounded-2xl p-8 shadow-2xl shadow-brand-900/30">
          <h2 className="text-2xl font-bold text-white mb-1">Reset password</h2>
          <p className="text-gray-400 text-sm mb-6">We'll email you a reset link.</p>

          {sent ? (
            <p className="text-green-300 text-sm bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              If that email exists, a reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-300">{error}</p>}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
              <button className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium transition shadow-lg shadow-brand-900/40">
                Send reset link
              </button>
            </form>
          )}

          <p className="text-sm text-gray-400 mt-6 text-center">
            <Link to="/login" className="text-brand-400 font-medium hover:text-brand-300">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}