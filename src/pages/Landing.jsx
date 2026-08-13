import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4">
      <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
      <h1 className="text-4xl font-bold mb-2 text-center">Cousin Connect</h1>
      <p className="text-lg text-indigo-100 mb-10 text-center max-w-md">
        A private space for our family to chat, share memories, plan events and have fun together.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 bg-indigo-800 text-white rounded-xl font-semibold hover:bg-indigo-900 transition border border-indigo-400"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}