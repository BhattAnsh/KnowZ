import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import axios from 'axios';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    primary_skill?: string;
    secondary_skill?: string;
    learning_goal?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Export the AuthContext so it can be imported in useAuth.ts
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (token && userId && username) {
      setUser({ id: userId, username });
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ username, password });
      const { access_token, user_id } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('username', username);
      
      // Add this line to update the user state
      setUser({ id: user_id, username });
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    primary_skill?: string;
    secondary_skill?: string;
    learning_goal?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the register API
      await authAPI.register(userData);
      
      // After successful registration, log in
      await login(userData.username, userData.password);
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Removed useAuth hook. It has been moved to a separate file.

// Add this at the end of the file, after AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};