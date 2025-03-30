import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserAlt, FaExchangeAlt, FaComments, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navbar';

interface PendingMatch {
  user_id: string;
  username: string;
  match_percentage: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    pendingMatches: 0,
    matchCount: 0,
    messageCount: 0
  });
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchNotification, setMatchNotification] = useState<{username: string, user_id: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Get matches (mutual likes)
      const matchesRes = await axios.get('http://localhost:8088/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get pending matches (people who liked you)
      const pendingRes = await axios.post('http://localhost:8088/pending-matches', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get potential matches
      const potentialRes = await axios.post('http://localhost:8088/predict', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPendingMatches(pendingRes.data.pending_matches || []);
      
      setStats({
        pendingMatches: pendingRes.data.pending_matches?.length || 0,
        matchCount: matchesRes.data.matches?.length || 0,
        messageCount: matchesRes.data.matches?.reduce(
          (sum: number, match: { message_count?: number }) => sum + (match.message_count || 0), 0
        ) || 0
      });

    } catch (err) {
      console.error("Error fetching dashboard data", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMatch = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        'http://localhost:8088/swipe',
        { target_user_id: userId, liked: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending list
      setPendingMatches(prev => prev.filter(match => match.user_id !== userId));
      
      // Check if this created a match
      if (response.data.is_match && response.data.match_details) {
        setMatchNotification(response.data.match_details);
        // Show notification for 5 seconds then hide
        setTimeout(() => setMatchNotification(null), 5000);
      }
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error("Error approving match", err);
    }
  };

  const handleRejectMatch = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        'http://localhost:8088/swipe',
        { target_user_id: userId, liked: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from pending list
      setPendingMatches(prev => prev.filter(match => match.user_id !== userId));
    } catch (err) {
      console.error("Error rejecting match", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171c19]">
        <Navigation />
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171c19]">
      <Navigation />
      
      {matchNotification && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-green-900/90 p-4 rounded-xl border border-green-500 text-center max-w-md"
          >
            <FaCheckCircle className="inline-block text-green-400 mr-2" />
            <span className="text-white font-medium">
              It's a match with {matchNotification.username}! You can now message each other.
            </span>
            <div className="mt-2">
              <Link 
                to={`/messages`} 
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
              >
                Start Chatting
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-8 mt-4">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#252b27] p-6 rounded-xl border border-green-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Pending Approvals</h2>
              <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                <FaUserAlt className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">{stats.pendingMatches}</p>
            <button 
              onClick={() => document.getElementById('pending-matches-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-green-500 hover:text-green-400 text-sm"
            >
              View pending matches →
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#252b27] p-6 rounded-xl border border-green-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Your Matches</h2>
              <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                <FaUsers className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">{stats.matchCount}</p>
            <Link to="/messages" className="text-green-500 hover:text-green-400 text-sm">
              View your matches →
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#252b27] p-6 rounded-xl border border-green-700/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Messages</h2>
              <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                <FaComments className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">{stats.messageCount}</p>
            <Link to="/messages" className="text-green-500 hover:text-green-400 text-sm">
              View conversations →
            </Link>
          </motion.div>
        </div>
        
        {pendingMatches.length > 0 && (
          <div id="pending-matches-section" className="bg-[#252b27] p-6 rounded-xl border border-green-700/30 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Pending Match Approvals</h2>
            <p className="text-gray-400 mb-4">These users have liked your profile. Approve to match with them!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingMatches.map(match => (
                <div key={match.user_id} className="bg-[#1f2421] p-4 rounded-lg border border-green-700/20">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-900/40 flex items-center justify-center mr-3">
                      <FaUserAlt className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{match.username}</h3>
                      <div className="text-sm text-green-400">
                        {match.match_percentage}% Match
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => handleRejectMatch(match.user_id)}
                      className="flex-1 mr-2 py-2 px-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg flex items-center justify-center"
                    >
                      <FaTimesCircle className="mr-1.5" />
                      Decline
                    </button>
                    <button 
                      onClick={() => handleApproveMatch(match.user_id)}
                      className="flex-1 ml-2 py-2 px-3 bg-green-900/20 hover:bg-green-900/30 text-green-400 rounded-lg flex items-center justify-center"
                    >
                      <FaCheckCircle className="mr-1.5" />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-[#252b27] p-6 rounded-xl border border-green-700/30 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">How KnowZ Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#1f2421] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
                <span className="text-green-500 font-bold">1</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Set Your Skills</h3>
              <p className="text-gray-400">Add what you know and what you want to learn.</p>
            </div>
            
            <div className="p-4 bg-[#1f2421] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
                <span className="text-green-500 font-bold">2</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Find Matches</h3>
              <p className="text-gray-400">Discover others who can teach what you want to learn.</p>
            </div>
            
            <div className="p-4 bg-[#1f2421] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mb-3">
                <span className="text-green-500 font-bold">3</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Start Learning</h3>
              <p className="text-gray-400">Connect and arrange to share knowledge.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
