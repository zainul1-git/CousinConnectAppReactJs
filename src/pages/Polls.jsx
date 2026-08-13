import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

export default function Polls() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const fetchPolls = async () => {
    try {
      const { data } = await apiClient.get('/polls');
      setPolls(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => setOptions([...options, '']);

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o !== '');
    if (!question.trim() || cleanOptions.length < 2) return;
    await apiClient.post('/polls', { question, options: cleanOptions });
    setQuestion('');
    setOptions(['', '']);
    setShowForm(false);
    fetchPolls();
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await apiClient.post(`/polls/${pollId}/vote`, { pollOptionId: optionId });
      fetchPolls();
    } catch (err) {
      fetchPolls();
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll?')) return;
    await apiClient.delete(`/polls/${pollId}`);
    fetchPolls();
  };

  if (loading) return <p className="text-gray-500">Loading polls...</p>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            🗳️ Polls
          </h1>
          <p className="text-gray-500">Family decisions, made together</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition"
        >
          {showForm ? 'Cancel' : '+ New Poll'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePoll} className="bg-white rounded-2xl border border-brand-100 p-4 mb-6 space-y-3 shadow-sm">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          ))}
          <button type="button" onClick={addOptionField} className="text-sm text-brand-600 font-medium">
            + Add option
          </button>
          <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 transition">
            Create Poll
          </button>
        </form>
      )}

      {polls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center text-gray-400">
          No polls yet.
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
            return (
              <div key={poll.id} className="bg-white rounded-2xl border border-brand-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-800">{poll.question}</h3>
                  {poll.createdByUserId === user.id && (
                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      className="text-red-500 text-xs hover:text-red-700 shrink-0"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">by {poll.createdByName}</p>

                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => !poll.hasCurrentUserVoted && handleVote(poll.id, opt.id)}
                        disabled={poll.hasCurrentUserVoted}
                        className={`w-full text-left relative overflow-hidden rounded-lg border px-3 py-2 text-sm ${
                          opt.isVotedByCurrentUser ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                        } ${!poll.hasCurrentUserVoted ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
                      >
                        {poll.hasCurrentUserVoted && (
                          <div className="absolute inset-y-0 left-0 bg-brand-100" style={{ width: `${pct}%` }} />
                        )}
                        <div className="relative flex justify-between">
                          <span>{opt.optionText}</span>
                          {poll.hasCurrentUserVoted && (
                            <span className="text-gray-500">{pct}% ({opt.voteCount})</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}