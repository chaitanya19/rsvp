import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, FileText, Plus, X, Save } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_attendees: '',
    is_public: true,
    allow_comments: true,
    dietary_restrictions: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.event_date = 'Event date cannot be in the past';
      }
    }

    if (formData.max_attendees && parseInt(formData.max_attendees) < 1) {
      newErrors.max_attendees = 'Maximum attendees must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/events', formData);
      navigate(`/event/${response.data.event.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      const message = error.response?.data?.error || 'Failed to create event';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-600">
          Plan your event with all the details your guests need to know
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-600">Essential details about your event</p>
          </div>
          
          <div className="card-body space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 ${
                  errors.title 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                placeholder="Describe your event..."
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Date & Time</h2>
            <p className="text-sm text-gray-600">When and where your event will take place</p>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    min={getMinDate()}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 ${
                      errors.event_date 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.event_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="event_time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                  placeholder="Enter event location"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Event Settings</h2>
            <p className="text-sm text-gray-600">Configure how your event works</p>
          </div>
          
          <div className="card-body space-y-6">
            <div>
              <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="max_attendees"
                  name="max_attendees"
                  min="1"
                  value={formData.max_attendees}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:z-10 ${
                    errors.max_attendees 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              {errors.max_attendees && (
                <p className="mt-1 text-sm text-red-600">{errors.max_attendees}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Public Event</h3>
                  <p className="text-sm text-gray-500">Anyone can see and RSVP to this event</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Allow Comments</h3>
                  <p className="text-sm text-gray-500">Guests can leave comments when RSVPing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_comments"
                    checked={formData.allow_comments}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Dietary Restrictions</h3>
                  <p className="text-sm text-gray-500">Collect dietary restriction information from guests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="dietary_restrictions"
                    checked={formData.dietary_restrictions}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary inline-flex items-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
