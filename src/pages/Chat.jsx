import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { getChatConnection } from '../lib/signalr';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7168/api').replace('/api', '');

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const connectionRef = useRef(null);

  // SignalR connection - ek dafa banti hai jab tak component mounted hai
  useEffect(() => {
    const connection = getChatConnection();
    connectionRef.current = connection;

    connection.on('ReceiveMessage', (message) => {
      setMessages((prev) => {
        // Agar message isi conversation ka hai jo abhi open hai, to list mein add karo
        if (activeConvoRef.current && message.conversationId === activeConvoRef.current.id) {
          return [...prev, message];
        }
        return prev;
      });
      // Conversations list bhi refresh kar do (last message update ho)
      fetchConversations();
    });

    connection.on('UserOnlineStatusChanged', (userId, isOnline) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.otherUserId === userId ? { ...c, isOtherUserOnline: isOnline } : c
        )
      );
    });

    if (connection.state === 'Disconnected') {
      connection.start().catch((err) => console.error('SignalR connection error:', err));
    }

    return () => {
      connection.off('ReceiveMessage');
      connection.off('UserOnlineStatusChanged');
    };
  }, []);

  // activeConvo ko ref mein bhi rakhte hain taake SignalR callback ke andar latest value mile
  const activeConvoRef = useRef(null);
  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);

  const fetchConversations = async () => {
    const { data } = await apiClient.get('/chat/conversations');
    setConversations(data);
    setLoading(false);
    return data;
  };

  useEffect(() => {
    fetchConversations().then(async (data) => {
      // Agar URL mein ?with=userId hai (Cousins page se "Message" click hua), to us se chat start karo
      const withUserId = searchParams.get('with');
      if (withUserId) {
        const { data: convo } = await apiClient.post(`/chat/conversations/with/${withUserId}`);
        setActiveConvo(convo);
        fetchConversations();
      } else if (data.length > 0) {
        setActiveConvo(data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (activeConvo) {
      apiClient.get(`/chat/conversations/${activeConvo.id}/messages`).then(({ data }) => {
        setMessages(data);
      });
    }
  }, [activeConvo?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvo) return;

    const connection = connectionRef.current;
    try {
      await connection.invoke('SendMessage', {
        conversationId: activeConvo.id,
        content: messageText,
      });
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) return <p className="text-gray-500">Loading chat...</p>;

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
      {/* Conversation list */}
      <div className={`w-full md:w-72 border-r border-gray-100 flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">💬 Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">
              No conversations yet. Go to Cousins to start one!
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvo(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 transition ${
                  activeConvo?.id === c.id ? 'bg-brand-50' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold overflow-hidden">
                    {c.otherUserAvatarUrl ? (
                      <img src={`${API_ORIGIN}${c.otherUserAvatarUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      c.otherUserName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      c.isOtherUserOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{c.otherUserName}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMessage || 'Say hello!'}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Active conversation */}
      <div className={`flex-1 flex-col ${activeConvo ? 'flex' : 'hidden md:flex'}`}>
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setActiveConvo(null)} className="md:hidden text-gray-500">
                ←
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {activeConvo.otherUserAvatarUrl ? (
                  <img src={`${API_ORIGIN}${activeConvo.otherUserAvatarUrl}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  activeConvo.otherUserName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{activeConvo.otherUserName}</p>
                <p className="text-xs text-gray-400">
                  {activeConvo.isOtherUserOnline ? '🟢 Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMine = m.senderId === user.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-brand-100' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}