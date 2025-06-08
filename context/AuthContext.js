import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from './services/api';
import { ROUTES, COLLECTIONS, UI } from './constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Example usage
const fetchData = async () => {
  const posts = await api.getCollection('posts');
  // ...
};

const handleNavigation = () => {
  navigate(ROUTES.PROFILE);
}; 