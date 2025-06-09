import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading, error } = useAuth();
  const [auth, setAuth] = useState({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    setAuth({ user, loading, error });
  }, [user, loading, error]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <AuthContext.Provider value={{ ...auth, handleNavigation }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
