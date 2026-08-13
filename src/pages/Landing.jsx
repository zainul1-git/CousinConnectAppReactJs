import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900 text-white flex flex-col items-center justify-center px-4">
      {/* Background glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-brand-500 rounded-full blur-3xl opacity-10" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-4xl mb-6 shadow-lg shadow-brand-900/50">
          👨‍👩‍👧‍👦
        </div>

        <h1
          className="text-5xl font-extrabold mb-3 text-center bg-gradient-to-r from-white via-brand-100 to-brand-300 bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Cousin Connect
        </h1>
        <p className="text-dark-500 text-lg mb-10 text-center max-w-md text-gray-300">
          A private space for our family to chat, share memories, plan events and have fun together.
        </p>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-7 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition shadow-lg shadow-brand-900/40 hover:shadow-brand-700/50 hover:-translate-y-0.5"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-7 py-3 bg-dark-600 hover:bg-dark-500 rounded-xl font-semibold transition border border-brand-500/30 hover:border-brand-400/60 hover:-translate-y-0.5"
          >
            Sign Up
          </Link>
        </div>

        <div className="flex items-center gap-6 mt-14 text-gray-500 text-sm">
          <span className="flex items-center gap-1.5">💬 Real-time Chat</span>
          <span className="flex items-center gap-1.5">📸 Memories</span>
          <span className="flex items-center gap-1.5">🎮 Fun Zone</span>
        </div>
      </div>
    </div>
  );
}