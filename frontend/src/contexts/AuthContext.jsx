import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = () => {
    const authData = sessionStorage.getItem('auth');
    
    if (!authData) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const { token, expiresAt } = JSON.parse(authData);
      
      if (!token || !expiresAt) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('auth');
        return false;
      }

      const expirationDate = new Date(expiresAt);
      const now = new Date();

      if (expirationDate <= now) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('auth');
        return false;
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      sessionStorage.removeItem('auth');
      return false;
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const login = (token, username, expiresAt) => {
    const authData = {
      token,
      username,
      expiresAt
    };
    sessionStorage.setItem('auth', JSON.stringify(authData));
    
    const payload = decodeJwt(token);
    if (payload && payload.userId) {
      sessionStorage.setItem('userId', payload.userId.toString());
    }
    
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  const getToken = () => {
    try {
      const authData = sessionStorage.getItem('auth');
      if (!authData) return null;
      
      const { token } = JSON.parse(authData);
      return token || null;
    } catch (error) {
      return null;
    }
  };

  const getUsername = () => {
    try {
      const authData = sessionStorage.getItem('auth');
      if (!authData) return null;
      
      const { username } = JSON.parse(authData);
      return username || null;
    } catch (error) {
      return null;
    }
  };

  const getUserId = () => {
    return sessionStorage.getItem('userId');
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    getToken,
    getUsername,
    getUserId
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
