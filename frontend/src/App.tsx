import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import SkillProfile from './components/SkillProfile';
import Matchmaking from './components/Matchmaking';
import Community from './components/Community';
import MessagingSystem from './components/MessagingSystem';
import Features from './components/Features';
import Hero from './components/Hero';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-[#0e130d] to-[#131a13] text-gray-900 dark:text-white">
            <Navbar />
            <main className="pt-16">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Hero />} />
                <Route path="/features" element={<Features />} />
                <Route path="/auth" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                <Route path="/profile" element={<ProtectedRoute element={<SkillProfile />} />} />
                <Route path="/matchmaking" element={<ProtectedRoute element={<Matchmaking />} />} />
                <Route path="/messages" element={<ProtectedRoute element={<MessagingSystem />} />} />
                <Route path="/community" element={<ProtectedRoute element={<Community />} />} />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;