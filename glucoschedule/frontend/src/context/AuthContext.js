// ============================================
// Context: AuthContext
// ============================================
// Provides login/logout state to all components
// Wrap your app with <AuthProvider> to use it

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is stored in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('glucoUser');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('glucoUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('glucoUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook: use this in any component to access auth state
// Example: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
