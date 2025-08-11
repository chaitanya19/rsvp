import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Users, Clock, User, MessageSquare, CheckCircle, XCircle, Edit, Share2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    status: 'confirmed',
    comment: '',
    dietary_restrictions: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventResponse, rsvpResponse] = await Promise.all([
        axios.get(`/api/events/${id}`),
        isAuthenticated ? axios.get(`/api/rsvp/${id}/status`) : Promise.resolve({ data: { status: null } })
      ]);
      
      setEvent(eventResponse.data.event);
      setRsvpStatus(rsvpResponse.data.status);
    } catch (error) {
      console.error('Error fetching event details:', error);
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (e) => {
    e.preventDefault();
    setRsvpLoading(true);
    
    try {
      const response = await axios.post(`/api/rsvp/${id}`, rsvpForm);
      setRsvpStatus(rsvpForm.status);
      setShowRsvpForm(false);
      // Refresh event data to update attendee count
      fetchEventDetails();
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleRsvpChange = (e) => {
    const { name, value } = e.target;
    setRsvpForm({
      ...rsvpForm,
      [name]: value
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getRsvpButtonText = () => {
    if (!isAuthenticated) return 'Sign in to RSVP';
    if (rsvpStatus === 'confirmed') return 'Already Confirmed';
    if (rsvpStatus === 'declined') return 'Already Declined';
    return 'RSVP Now';
  };

  const getRsvpButtonVariant = () => {
    if (!isAuthenticated) return 'secondary';
    if (rsvpStatus === 'confirmed') return 'success';
    if (rsvpStatus === 'declined') return 'danger';
    return 'primary';
  };

  const isEventOwner = event?.user_id === user?.id;

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      {/* Event Header */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {event.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3 ml-6">
              {isEventOwner && (
                <button
                  onClick={() => navigate(`/edit-event/${id}`)}
                  className="btn btn-outline btn-sm inline-flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}
              <button className="btn btn-secondary btn-sm inline-flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3 text-primary-600" />
                <span>{formatDate(event.event_date)}</span>
              </div>
              
              {event.event_time && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-primary-600" />
                  <span>{formatTime(event.event_time)}</span>
                </div>
              )}
              
              {event.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-primary-600" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3 text-primary-600" />
                <span>
                  {event.confirmed_count || 0} confirmed
                  {event.max_attendees && ` / ${event.max_attendees} max`}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-3 text-primary-600" />
                <span>Organized by {event.organizer?.username || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Section */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">RSVP</h2>
        </div>
        
        <div className="card-body">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sign in to RSVP
              </h3>
              <p className="text-gray-600 mb-4">
                You need to be signed in to respond to this event
              </p>
              <button
                onClick={() => navigate('/login', { state: { from: { pathname: `/event/${id}` } } })}
                className="btn btn-primary"
              >
                Sign In
              </button>
            </div>
          ) : isEventOwner ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                You're the organizer
              </h3>
              <p className="text-gray-600">
                You can't RSVP to your own event, but you can manage it from your dashboard
              </p>
            </div>
          ) : (
            <div>
              {!showRsvpForm ? (
                <div className="text-center py-8">
                  {rsvpStatus ? (
                    <div className="mb-6">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        rsvpStatus === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rsvpStatus === 'confirmed' ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {rsvpStatus === 'confirmed' ? 'Confirmed' : 'Declined'}
                      </div>
                    </div>
                  ) : null}
                  
                  <button
                    onClick={() => setShowRsvpForm(true)}
                    className="btn btn-primary btn-lg"
                  >
                    {rsvpStatus ? 'Change RSVP' : 'RSVP Now'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRsvp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Will you attend this event?
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="confirmed"
                          checked={rsvpForm.status === 'confirmed'}
                          onChange={handleRsvpChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">Yes, I'll be there!</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="declined"
                          checked={rsvpForm.status === 'declined'}
                          onChange={handleRsvpChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">Sorry, I can't make it</span>
                      </label>
                    </div>
                  </div>

                  {event.allow_comments && (
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (optional)
                      </label>
                      <textarea
                        id="comment"
                        name="comment"
                        rows={3}
                        value={rsvpForm.comment}
                        onChange={handleRsvpChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Any additional comments..."
                      />
                    </div>
                  )}

                  {event.dietary_restrictions && rsvpForm.status === 'confirmed' && (
                    <div>
                      <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Restrictions (optional)
                      </label>
                      <input
                        type="text"
                        id="dietary_restrictions"
                        name="dietary_restrictions"
                        value={rsvpForm.dietary_restrictions}
                        onChange={handleRsvpChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., vegetarian, gluten-free, allergies..."
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowRsvpForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={rsvpLoading}
                      className="btn btn-primary inline-flex items-center"
                    >
                      {rsvpLoading ? (
                        <LoadingSpinner size="sm" className="text-white" />
                      ) : (
                        <>
                          {rsvpForm.status === 'confirmed' ? 'Confirm Attendance' : 'Submit Response'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attendees List */}
      {event.attendees && event.attendees.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Attendees</h2>
            <span className="text-sm text-gray-500">
              {event.attendees.length} people confirmed
            </span>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {attendee.username}
                    </p>
                    {attendee.comment && (
                      <p className="text-xs text-gray-500 mt-1">
                        "{attendee.comment}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
