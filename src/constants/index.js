// Firebase Collections
export const COLLECTIONS = {
  USERS: "users",
  POSTS: "posts",
  GROUPS: "groups",
  TODOS: "todos",
  SESSIONS: "sessions",
};

// Routes
export const ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  GROUPS: "/groups",
  CALENDAR: "/calendar",
  TODOS: "/todos",
  FEED: "/feed",
  AUTH: "/auth",
};

// User roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
};

// Status types
export const STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  COMPLETED: "completed",
};

// Form types
export const FORM_TYPES = {
  CONFIRM: "confirm",
  FORM: "form",
  INFO: "info",
};

// File types
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

// Other constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const DEFAULT_PAGE_SIZE = 10;

// UI Constants
export const UI = {
  TOAST_DURATION: 3000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// API Constants
export const API = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};
