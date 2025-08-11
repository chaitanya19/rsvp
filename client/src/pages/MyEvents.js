import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Eye, Edit, Trash2, Plus, Filter, Search, MoreHorizontal } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events/my-events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(eventId);
    
    try {
      await axios.delete(`/api/events/${eventId}`);
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    
    if (eventDate < now) {
      return { status: 'past', label: 'Past Event', color: 'text-gray-500 bg-gray-100' };
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: 'today', label: 'Today', color: 'text-orange-600 bg-orange-100' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', color: 'text-green-600 bg-green-100' };
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || 
      (filter === 'upcoming' && new Date(event.event_date) > new Date()) ||
      (filter === 'past' && new Date(event.event_date) < new Date());
    
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
          <p className="text-gray-600">
            Manage all the events you've created
          </p>
        </div>
        <Link
          to="/create-event"
          className="btn btn-primary btn-lg inline-flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-6">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            return (
              <div key={event.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventStatus.color}`}>
                          {eventStatus.label}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.event_date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.confirmed_count || 0} confirmed
                          {event.max_attendees && ` / ${event.max_attendees} max`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <Link
                        to={`/event/${event.id}`}
                        className="btn btn-secondary btn-sm inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/edit-event/${event.id}`}
                        className="btn btn-outline btn-sm inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleteLoading === event.id}
                        className="btn btn-danger btn-sm inline-flex items-center"
                      >
                        {deleteLoading === event.id ? (
                          <LoadingSpinner size="sm" className="text-white" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          {events.length === 0 ? (
            <>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first event
              </p>
              <Link to="/create-event" className="btn btn-primary">
                Create Your First Event
              </Link>
            </>
          ) : (
            <>
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Stats Summary */}
      {events.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                <div className="text-sm text-gray-500">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => new Date(e.event_date) > new Date()).length}
                </div>
                <div className="text-sm text-gray-500">Upcoming</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {events.filter(e => new Date(e.event_date) < new Date()).length}
                </div>
                <div className="text-sm text-gray-500">Past Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {events.reduce((sum, e) => sum + (e.confirmed_count || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Total Attendees</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
