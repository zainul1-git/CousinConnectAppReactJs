import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  dob: '',
  inviteCode: '',
};

const inputClass =
  'w-full px-3 py-2.5 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition';
const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (avatarFile) payload.append('avatar', avatarFile);

      await signup(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900 flex items-center justify-center px-4 py-10">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-25" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-15" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-white">
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Cousin Connect
          </span>
        </Link>

        <div className="bg-dark-700/80 backdrop-blur-xl border border-brand-500/20 rounded-2xl p-8 shadow-2xl shadow-brand-900/30">
          <h2 className="text-2xl font-bold text-white mb-1">Join the family 🎉</h2>
          <p className="text-gray-400 text-sm mb-6">You'll need a cousin invite code to sign up.</p>

          {error && (
            <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Cousin Invite Code</label>
              <input
                type="text"
                name="inviteCode"
                required
                value={form.inviteCode}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. FAM-2026-XYZ"
              />
            </div>

            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                required
                value={form.dob}
                onChange={handleChange}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Profile Picture <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white file:text-sm hover:file:bg-brand-500 file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 shadow-lg shadow-brand-900/40"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-medium hover:text-brand-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}