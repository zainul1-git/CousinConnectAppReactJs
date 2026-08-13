import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

const truths = [
  "What's the most embarrassing thing you've done at a family event?",
  "Who's your favorite cousin and why? (be honest!)",
  "What's a secret talent nobody in the family knows about?",
  "What's the weirdest food combination you actually enjoy?",
  "If you could swap lives with one cousin for a day, who and why?",
];

const dares = [
  "Send a voice note singing the family's favorite song.",
  "Text the family group your most used emoji, 5 times in a row.",
  "Do your best impression of another cousin.",
  "Share the last photo in your gallery (no cheating!).",
  "Compliment three cousins right now.",
];

const challenges = [
  "Plan a surprise call with your favorite cousin this week.",
  "Share an old childhood photo in Memories.",
  "Start a poll about the next family hangout.",
  "Wish someone happy birthday a week early, just because.",
  "Comment something nice on 3 recent memories.",
];

const quizQuestions = [
  { q: "Who is most likely to be late to every family event?", a: null },
  { q: "Who tells the best jokes in the family?", a: null },
  { q: "Who is the most competitive cousin?", a: null },
  { q: "Who would survive longest in a jungle?", a: null },
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function FunZone() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [cousins, setCousins] = useState([]);
  const [spinResult, setSpinResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');

  useEffect(() => {
    apiClient.get('/cousins').then(({ data }) => setCousins(data));
  }, []);

  const awardPoints = async (points, reason) => {
    try {
      await apiClient.post('/leaderboard/award', { userId: user.id, points, reason });
    } catch (err) {
      // ignore silently, gamification ke liye critical nahi
    }
  };

  const handleTruthOrDare = (type) => {
    setActiveGame('truthordare');
    setCurrentPrompt(randomFrom(type === 'truth' ? truths : dares));
  };

  const handleChallenge = () => {
    setActiveGame('challenge');
    setCurrentPrompt(randomFrom(challenges));
  };

  const handleSpin = () => {
    if (cousins.length === 0) return;
    setSpinning(true);
    setSpinResult(null);
    setTimeout(() => {
      setSpinResult(randomFrom(cousins).fullName);
      setSpinning(false);
    }, 1200);
  };

  const handleQuizSubmit = async () => {
    if (!quizAnswer.trim()) return;
    await awardPoints(5, 'Fun Zone quiz');
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setQuizAnswer('');
    } else {
      setActiveGame('quizDone');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">🎮 Fun Zone</h1>
      <p className="text-gray-500 mb-6">Games, challenges, and family fun</p>

      {!activeGame && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleTruthOrDare('truth')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-brand-400 transition"
          >
            <p className="text-2xl mb-2">🎭</p>
            <p className="font-semibold text-gray-800">Truth or Dare</p>
            <p className="text-sm text-gray-500">Get a random truth or dare</p>
          </button>

          <button
            onClick={() => setActiveGame('quiz')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-indigo-400 transition"
          >
            <p className="text-2xl mb-2">🧠</p>
            <p className="font-semibold text-gray-800">Who Knows Me Best?</p>
            <p className="text-sm text-gray-500">Answer fun family quiz questions</p>
          </button>

          <button
            onClick={handleChallenge}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-indigo-400 transition"
          >
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-semibold text-gray-800">Random Challenge</p>
            <p className="text-sm text-gray-500">Get a random family challenge</p>
          </button>

          <button
            onClick={() => setActiveGame('wheel')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-indigo-400 transition"
          >
            <p className="text-2xl mb-2">🎡</p>
            <p className="font-semibold text-gray-800">Spin the Wheel</p>
            <p className="text-sm text-gray-500">Randomly pick a cousin</p>
          </button>
        </div>
      )}

      {activeGame === 'truthordare' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-lg text-gray-800 mb-6">{currentPrompt}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleTruthOrDare('truth')}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              New Truth
            </button>
            <button
              onClick={() => handleTruthOrDare('dare')}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              New Dare
            </button>
            <button onClick={() => setActiveGame(null)} className="text-gray-500 px-4 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {activeGame === 'challenge' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-lg text-gray-800 mb-6">🎯 {currentPrompt}</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleChallenge} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">
              New Challenge
            </button>
            <button onClick={() => setActiveGame(null)} className="text-gray-500 px-4 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {activeGame === 'wheel' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className={`text-5xl mb-4 ${spinning ? 'animate-spin' : ''}`}>🎡</div>
          {spinResult && !spinning && (
            <p className="text-xl font-bold text-brand-600 mb-4">🎉 {spinResult}!</p>
          )}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {spinning ? 'Spinning...' : 'Spin'}
            </button>
            <button onClick={() => setActiveGame(null)} className="text-gray-500 px-4 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {activeGame === 'quiz' && (
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Question {quizIndex + 1} of {quizQuestions.length}
          </p>
          <p className="text-lg text-gray-800 mb-4">{quizQuestions[quizIndex].q}</p>
          <input
            type="text"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            placeholder="Type a cousin's name..."
            className="w-full max-w-sm mx-auto px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-center gap-3">
            <button onClick={handleQuizSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">
              Submit (+5 pts)
            </button>
            <button onClick={() => setActiveGame(null)} className="text-gray-500 px-4 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {activeGame === 'quizDone' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-lg text-gray-800 mb-4">🎉 Quiz complete! You earned points.</p>
          <button
            onClick={() => {
              setActiveGame(null);
              setQuizIndex(0);
              setQuizAnswer('');
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Fun Zone
          </button>
        </div>
      )}
    </div>
  );
}