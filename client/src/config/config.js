const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5010',
  API_TIMEOUT: 10000, // 10 seconds
  
  // App Configuration
  APP_NAME: 'RSVP Hub',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  FEATURES: {
    GIT_INTEGRATION: true,
    GUEST_RSVP: true,
    DIETARY_RESTRICTIONS: true,
    PLUS_ONE_SUPPORT: true,
    EMAIL_NOTIFICATIONS: false, // Future feature
    SMS_NOTIFICATIONS: false,   // Future feature
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  
  // File Upload
  UPLOADS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  },
  
  // Validation Rules
  VALIDATION: {
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 30,
      PATTERN: /^[a-zA-Z0-9_-]+$/,
    },
    PASSWORD: {
      MIN_LENGTH: 6,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
    },
    EVENT: {
      TITLE_MAX_LENGTH: 100,
      DESCRIPTION_MAX_LENGTH: 1000,
      LOCATION_MAX_LENGTH: 200,
    },
  },
  
  // UI Configuration
  UI: {
    THEME: {
      PRIMARY_COLOR: '#3B82F6',
      SECONDARY_COLOR: '#6B7280',
      SUCCESS_COLOR: '#10B981',
      WARNING_COLOR: '#F59E0B',
      ERROR_COLOR: '#EF4444',
    },
    ANIMATIONS: {
      ENABLED: true,
      DURATION: 200,
    },
    NOTIFICATIONS: {
      AUTO_HIDE_DURATION: 5000,
      MAX_VISIBLE: 3,
    },
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'rsvp_auth_token',
    USER_PREFERENCES: 'rsvp_user_preferences',
    THEME: 'rsvp_theme',
    LANGUAGE: 'rsvp_language',
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. You do not have permission to view this resource.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful!',
    LOGOUT: 'Logged out successfully!',
    PROFILE_UPDATE: 'Profile updated successfully!',
    PASSWORD_CHANGE: 'Password changed successfully!',
    EVENT_CREATE: 'Event created successfully!',
    EVENT_UPDATE: 'Event updated successfully!',
    EVENT_DELETE: 'Event deleted successfully!',
    RSVP_CREATE: 'RSVP submitted successfully!',
    RSVP_UPDATE: 'RSVP updated successfully!',
    RSVP_CANCEL: 'RSVP cancelled successfully!',
  },
};

export default config;
