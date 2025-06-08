// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  GROUPS: 'groups',
  TODOS: 'todos',
  SESSIONS: 'sessions'
};

// Application Routes
export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  GROUPS: '/groups',
  CALENDAR: '/calendar',
  TODOS: '/todos',
  FEED: '/feed',
  AUTH: '/auth'
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

// Status Constants
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed'
};

// UI Constants
export const UI = {
  MODAL_TYPES: {
    CONFIRM: 'confirm',
    FORM: 'form',
    INFO: 'info'
  },
  TOAST_DURATION: 3000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
};

// API Constants
export const API = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
}; 