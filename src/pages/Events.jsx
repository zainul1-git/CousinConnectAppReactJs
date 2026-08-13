import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    eventDate: '',
    eventTime: '',
    location: '',
    description: '',
  });

  const fetchEvents = async () => {
    try {
      const { data } = await apiClient.get('/events');
      setEvents(data);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/events', form);
      setForm({ title: '', eventDate: '', eventTime: '', location: '', description: '' });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError('Failed to create event.');
    }
  };

  const handleRsvp = async (eventId, status) => {
    try {
      await apiClient.post(`/events/${eventId}/rsvp`, { status });
      fetchEvents();
    } catch (err) {
      setError('Failed to RSVP.');
    }
  };

  if (loading) return <p className="text-gray-500">Loading events...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">📅 Events</h1>
          <p className="text-gray-500">Family gatherings and meetups</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Family Dinner"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="eventDate"
                required
                value={form.eventDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="eventTime"
                value={form.eventTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Grandma's House"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Create Event
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No events yet. Create the first one!
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(event.eventDate).toLocaleDateString()}
                    {event.eventTime && ` · ⏰ ${event.eventTime}`}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-500">📍 {event.location}</p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created by {event.createdByName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  {event.goingCount > 0
                    ? `✅ ${event.goingCount} going: ${event.attendeeNames.join(', ')}`
                    : 'No one has RSVPed yet'}
                </p>
                <button
                  onClick={() => handleRsvp(event.id, event.isCurrentUserGoing ? 'NotGoing' : 'Going')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    event.isCurrentUserGoing
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {event.isCurrentUserGoing ? "✓ You're Going" : "RSVP"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}