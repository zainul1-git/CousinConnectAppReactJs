import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7168/api').replace('/api', '');

export default function Memories() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  const fetchPosts = async () => {
    try {
      const { data } = await apiClient.get('/posts');
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    const formData = new FormData();
    formData.append('Content', content);
    if (imageFile) formData.append('image', imageFile);
    await apiClient.post('/posts', formData);
    setContent('');
    setImageFile(null);
    fetchPosts();
  };

  const handleLike = async (postId) => {
    await apiClient.post(`/posts/${postId}/like`);
    fetchPosts();
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    await apiClient.post(`/posts/${postId}/comments`, { content: text });
    setCommentInputs({ ...commentInputs, [postId]: '' });
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this memory?')) return;
    await apiClient.delete(`/posts/${postId}`);
    fetchPosts();
  };

  if (loading) return <p className="text-gray-500">Loading memories...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        📸 Memories
      </h1>
      <p className="text-gray-500 mb-6">Share moments with the family</p>

      <form onSubmit={handleCreatePost} className="bg-white rounded-2xl border border-brand-100 p-4 mb-6 shadow-sm">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a memory..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex items-center justify-between mt-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-100 file:text-brand-700 file:text-sm hover:file:bg-brand-200 file:cursor-pointer"
          />
          <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition">
            Post
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center text-gray-400">
          No memories shared yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-brand-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold overflow-hidden">
                    {post.userAvatarUrl ? (
                      <img src={`${API_ORIGIN}${post.userAvatarUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      post.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{post.userName}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {post.userId === user.id && (
                  <button onClick={() => handleDeletePost(post.id)} className="text-red-500 text-xs hover:text-red-700">
                    🗑️ Delete
                  </button>
                )}
              </div>

              {post.content && <p className="text-gray-700 mb-3">{post.content}</p>}

              {post.imageUrl && (
                <img
                  src={`${API_ORIGIN}${post.imageUrl}`}
                  alt="Memory"
                  className="w-full rounded-xl mb-3 max-h-96 object-cover"
                />
              )}

              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`text-sm font-medium ${post.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-500'}`}
                >
                  {post.isLikedByCurrentUser ? '❤️' : '🤍'} {post.likesCount}
                </button>
                <span className="text-sm text-gray-500">💬 {post.comments.length}</span>
              </div>

              <div className="mt-3 space-y-2">
                {post.comments.map((c) => (
                  <div key={c.id} className="text-sm bg-brand-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-800">{c.userName}: </span>
                    <span className="text-gray-600">{c.content}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button onClick={() => handleComment(post.id)} className="text-sm text-brand-600 font-medium">
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}