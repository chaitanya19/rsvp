import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Users, ArrowRight, Plus, CheckCircle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events?limit=6&status=active');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
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

  const features = [
    {
      icon: Calendar,
      title: 'Easy Event Management',
      description: 'Create and manage events with just a few clicks. Set dates, locations, and capacity limits.'
    },
    {
      icon: Users,
      title: 'Smart RSVP System',
      description: 'Track attendance, manage guest lists, and handle dietary restrictions seamlessly.'
    },
    {
      icon: CheckCircle,
      title: 'Git-Based Storage',
      description: 'All your event data is safely stored in Git repositories with full version control.'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Organize Events with
            <span className="text-primary-600"> Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your event planning with our comprehensive RSVP system. 
            Create events, manage attendees, and track responses all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/create-event"
                className="btn btn-primary btn-lg inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Event
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn btn-primary btn-lg inline-flex items-center"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            )}
            <Link
              to="/dashboard"
              className="btn btn-secondary btn-lg"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Event Success
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform provides all the tools you need to create, manage, and track your events effectively.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card text-center p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Events Section */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Upcoming Events
            </h2>
            <p className="text-gray-600">
              Discover and join exciting events happening soon
            </p>
          </div>
          <Link
            to="/dashboard"
            className="btn btn-secondary inline-flex items-center"
          >
            View All Events
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.event_date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {event.confirmed_count || 0} confirmed
                      {event.max_attendees && ` / ${event.max_attendees} max`}
                    </div>
                  </div>
                  
                  <Link
                    to={`/event/${event.id}`}
                    className="btn btn-primary w-full"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to create an event!
            </p>
            {isAuthenticated && (
              <Link to="/create-event" className="btn btn-primary">
                Create Your First Event
              </Link>
            )}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl text-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event organizers who trust our platform to manage their events.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary btn-lg border-white text-white hover:bg-white hover:text-primary-700"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
