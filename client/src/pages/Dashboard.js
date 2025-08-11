import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Users, Plus, Eye, Edit, Trash2, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    pendingRSVPs: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, eventsResponse] = await Promise.all([
        axios.get('/api/events/stats'),
        axios.get('/api/events/my-events?limit=5')
      ]);
      
      setStats(statsResponse.data);
      setRecentEvents(eventsResponse.data.events);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      return { status: 'past', label: 'Past Event', color: 'text-gray-500' };
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { status: 'today', label: 'Today', color: 'text-orange-600' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', color: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-primary-100 text-lg">
              Here's what's happening with your events
            </p>
          </div>
          <Link
            to="/create-event"
            className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending RSVPs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRSVPs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
            <Link
              to="/my-events"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all events →
            </Link>
          </div>
        </div>
        
        <div className="card-body">
          {recentEvents.length > 0 ? (
            <div className="space-y-4">
              {recentEvents.map((event) => {
                const eventStatus = getEventStatus(event);
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventStatus.color}`}>
                          {eventStatus.label}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(event.event_date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.confirmed_count || 0} confirmed
                          {event.max_attendees && ` / ${event.max_attendees} max`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
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
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/create-event"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4 group-hover:bg-primary-200 transition-colors duration-200">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Event
            </h3>
            <p className="text-gray-600">
              Start planning a new event with our easy-to-use form
            </p>
          </div>
        </Link>

        <Link
          to="/my-events"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 group-hover:bg-blue-200 transition-colors duration-200">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Manage Events
            </h3>
            <p className="text-gray-600">
              View and edit all your events in one place
            </p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profile Settings
            </h3>
            <p className="text-gray-600">
              Update your profile and account preferences
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
