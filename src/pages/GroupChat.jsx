import { useState, useEffect, useRef } from 'react';
import apiClient from '../lib/apiClient';
import { getChatConnection } from '../lib/signalr';
import { useAuth } from '../context/AuthContext';

export default function GroupChat() {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const connRef = useRef(null);

  useEffect(() => {
    apiClient
      .get('/groupchat/my-group')
      .then(({ data }) => {
        setGroup(data);
        return apiClient.get(`/groupchat/${data.id}/messages`);
      })
      .then((res) => setMessages(res.data))
      .catch((err) => {
        console.error('GroupChat error:', err);
        setError('Could not load family group.');
      })
      .finally(() => setLoading(false));

    const connection = getChatConnection();
    connRef.current = connection;
    connection.on('ReceiveGroupMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    if (connection.state === 'Disconnected') connection.start().catch(console.error);

    return () => connection.off('ReceiveGroupMessage');
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !group) return;
    await connRef.current.invoke('SendGroupMessage', { groupId: group.id, content: text });
    setText('');
  };

  if (loading) return <p className="text-gray-500">Loading group...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!group) return <p className="text-gray-500">No group found.</p>;

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">👨‍👩‍👧‍👦 {group.name}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMine = String(m.senderId) === String(user.id);
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                {!isMine && <p className="text-xs font-semibold text-brand-600 mb-0.5">{m.senderName}</p>}
                {m.content}
                <p className={`text-[10px] mt-1 ${isMine ? 'text-brand-100' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message the family..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700">
          Send
        </button>
      </form>
    </div>
  );
}