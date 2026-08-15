import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { getChatConnection } from '../lib/signalr';

const truthSuggestions = [
  "What's the most embarrassing thing you've done at a family event?",
  "Who's your favorite cousin and why? (be honest!)",
  "What's a secret talent nobody in the family knows about?",
  "What's the weirdest food combination you actually enjoy?",
];

const dareSuggestions = [
  "Send a voice note singing the family's favorite song.",
  "Do your best impression of another cousin.",
  "Share the last photo in your gallery (no cheating!).",
  "Compliment three cousins right now.",
];

const challenges = [
  "Plan a surprise call with your favorite cousin this week.",
  "Share an old childhood photo in Memories.",
  "Start a poll about the next family hangout.",
  "Comment something nice on 3 recent memories.",
];

const quizQuestions = [
  { q: "Who is most likely to be late to every family event?" },
  { q: "Who tells the best jokes in the family?" },
  { q: "Who is the most competitive cousin?" },
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function FunZone() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [customText, setCustomText] = useState('');
  const [cousins, setCousins] = useState([]);
  const [spinResult, setSpinResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [myGroupId, setMyGroupId] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    apiClient.get('/cousins').then(({ data }) => setCousins(data));
    apiClient.get('/groupchat/my-group').then(({ data }) => setMyGroupId(data.id)).catch(() => {});
  }, []);

  const awardPoints = async (points, reason) => {
    try {
      await apiClient.post('/leaderboard/award', { userId: user.id, points, reason });
    } catch (err) {
      // silent fail, gamification critical nahi
    }
  };

  const sendToGroup = async (content) => {
    if (!myGroupId) return;
    try {
      const connection = getChatConnection();
      if (connection.state === 'Disconnected') await connection.start();
      await connection.invoke('SendGroupMessage', { groupId: myGroupId, content });
    } catch (err) {
      console.error('Could not send to group', err);
    }
  };

  // Truth ya Dare - custom text bhejta hai jo user ne khud likha
  const handleSendCustom = async (type) => {
    if (!customText.trim()) return;
    setSending(true);
    const emoji = type === 'truth' ? '🎭 Truth (asked by ' + user.fullName + ')' : '🔥 Dare (asked by ' + user.fullName + ')';
    await sendToGroup(`${emoji}: ${customText.trim()}`);
    await awardPoints(3, 'Fun Zone - asked a truth/dare');
    setCustomText('');
    setSending(false);
  };

  const handleUseSuggestion = (type) => {
    setCustomText(randomFrom(type === 'truth' ? truthSuggestions : dareSuggestions));
  };

  const handleChallenge = async () => {
    const prompt = randomFrom(challenges);
    setSending(true);
    await sendToGroup(`🎯 Challenge: ${prompt}`);
    setSending(false);
  };

  const handleSpin = () => {
    if (cousins.length === 0) return;
    setSpinning(true);
    setSpinResult(null);
    setTimeout(async () => {
      const picked = randomFrom(cousins).fullName;
      setSpinResult(picked);
      setSpinning(false);
      await sendToGroup(`🎡 The wheel picked: ${picked}!`);
    }, 1200);
  };

  const handleQuizSubmit = async () => {
    if (!quizAnswer.trim()) return;
    await sendToGroup(`🧠 ${quizQuestions[quizIndex].q} — ${user.fullName} says: ${quizAnswer}`);
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
      <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        🎮 Fun Zone
      </h1>
      <p className="text-gray-500 mb-6">Games, challenges, and family fun — sent live to Family Group</p>

      {!activeGame && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveGame('truth')}
            className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 text-left hover:border-brand-400 transition"
          >
            <p className="text-2xl mb-2">🎭</p>
            <p className="font-semibold text-gray-800">Ask a Truth</p>
            <p className="text-sm text-gray-500">Write your own truth question for the family</p>
          </button>

          <button
            onClick={() => setActiveGame('dare')}
            className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 text-left hover:border-brand-400 transition"
          >
            <p className="text-2xl mb-2">🔥</p>
            <p className="font-semibold text-gray-800">Give a Dare</p>
            <p className="text-sm text-gray-500">Write your own dare for the family</p>
          </button>

          <button
            onClick={() => setActiveGame('quiz')}
            className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 text-left hover:border-brand-400 transition"
          >
            <p className="text-2xl mb-2">🧠</p>
            <p className="font-semibold text-gray-800">Who Knows Me Best?</p>
            <p className="text-sm text-gray-500">Answer fun family quiz questions</p>
          </button>

          <button
            onClick={handleChallenge}
            disabled={sending}
            className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 text-left hover:border-brand-400 transition disabled:opacity-50"
          >
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-semibold text-gray-800">Random Challenge</p>
            <p className="text-sm text-gray-500">Send a random challenge to the group</p>
          </button>

          <button
            onClick={() => setActiveGame('wheel')}
            className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 text-left hover:border-brand-400 transition"
          >
            <p className="text-2xl mb-2">🎡</p>
            <p className="font-semibold text-gray-800">Spin the Wheel</p>
            <p className="text-sm text-gray-500">Randomly pick a cousin</p>
          </button>
        </div>
      )}

      {(activeGame === 'truth' || activeGame === 'dare') && (
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-8">
          <p className="text-lg text-gray-800 mb-4 text-center">
            {activeGame === 'truth' ? '🎭 Write a Truth question' : '🔥 Write a Dare'}
          </p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder={activeGame === 'truth' ? "e.g. What's your most embarrassing memory?" : "e.g. Send a voice note singing!"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3"
          />
          <button
            onClick={() => handleUseSuggestion(activeGame)}
            className="text-sm text-brand-600 font-medium mb-4"
          >
            🎲 Use a random suggestion instead
          </button>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleSendCustom(activeGame)}
              disabled={sending || !customText.trim()}
              className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send to Family Group'}
            </button>
            <button onClick={() => { setActiveGame(null); setCustomText(''); }} className="text-gray-500 px-4 py-2">
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            This will post live in the Family Group chat — everyone can reply there!
          </p>
        </div>
      )}

      {activeGame === 'wheel' && (
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-8 text-center">
          <div className={`text-5xl mb-4 ${spinning ? 'animate-spin' : ''}`}>🎡</div>
          {spinResult && !spinning && (
            <p className="text-xl font-bold text-brand-600 mb-4">🎉 {spinResult}!</p>
          )}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
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
            className="w-full max-w-sm mx-auto px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-center gap-3">
            <button onClick={handleQuizSubmit} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium">
              Submit (+5 pts)
            </button>
            <button onClick={() => setActiveGame(null)} className="text-gray-500 px-4 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {activeGame === 'quizDone' && (
        <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-8 text-center">
          <p className="text-lg text-gray-800 mb-4">🎉 Quiz complete! You earned points.</p>
          <button
            onClick={() => {
              setActiveGame(null);
              setQuizIndex(0);
              setQuizAnswer('');
            }}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Fun Zone
          </button>
        </div>
      )}
    </div>
  );
}