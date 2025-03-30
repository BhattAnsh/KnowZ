import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserAlt, FaSearch, FaLightbulb, FaFilter, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

interface Skill {
  id: string;
  name: string;
}

interface MatchProfile {
  id: string;
  username: string;
  primary_skill?: string;
  secondary_skill?: string;
  learning_goal?: string;
  skills?: Skill[];
  goals?: Skill[];
  match_percentage: number;
}

const Matchmaking: React.FC = () => {
  const [mentors, setMentors] = useState<MatchProfile[]>([]);
  const [mentees, setMentees] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [matchNotification, setMatchNotification] = useState<MatchProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.post(
        'http://localhost:8088/predict',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.matches && response.data.matches.length > 0) {
        const mentorMatches: MatchProfile[] = [];
        const menteeMatches: MatchProfile[] = [];

        response.data.matches.forEach((match: { 
          id?: string; 
          _key?: string; 
          user_id?: string; 
          username?: string; 
          primary_skill?: string; 
          secondary_skill?: string; 
          learning_goal?: string; 
          skills?: Skill[]; 
          goals?: Skill[]; 
          match_percentage?: number; 
          match_type?: string; 
          can_teach_you?: boolean; 
          you_can_teach?: boolean; 
        }) => {
          const profile: MatchProfile = {
            id: match.id || match._key || match.user_id || 'unknown-id',
            username: match.username || 'Unknown User',
            primary_skill: match.primary_skill || match.skills?.[0]?.name,
            secondary_skill: match.secondary_skill,
            learning_goal: match.learning_goal || match.goals?.[0]?.name,
            skills: match.skills || [],
            goals: match.goals || [],
            match_percentage: match.match_percentage || Math.floor(Math.random() * 30) + 70
          };

          if (match.match_type === 'mentor' || match.can_teach_you) {
            mentorMatches.push(profile);
          } else if (match.match_type === 'mentee' || match.you_can_teach) {
            menteeMatches.push(profile);
          } else {
            mentorMatches.push(profile);
          }
        });

        setMentors(mentorMatches);
        setMentees(menteeMatches);
      } else {
        setError('No potential matches found. Try adding more skills!');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to load potential matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (userId: string, liked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.post(
        'http://localhost:8088/swipe',
        {
          target_user_id: userId,
          liked: liked
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.is_match && response.data.match_details) {
        const matchedUser = mentors.find(m => m.id === userId) || 
                           mentees.find(m => m.id === userId);
        
        if (matchedUser) {
          setMatchNotification(matchedUser);
          setTimeout(() => setMatchNotification(null), 5000);
        }
      }

      setMentors(prev => prev.filter(mentor => mentor.id !== userId));
      setMentees(prev => prev.filter(mentee => mentee.id !== userId));

    } catch (err) {
      console.error("Error recording swipe:", err);
    }
  };

  const filteredMentors = mentors.filter(mentor => 
    mentor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.primary_skill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.secondary_skill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.learning_goal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMentees = mentees.filter(mentee => 
    mentee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.primary_skill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.secondary_skill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentee.learning_goal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MatchCard = ({ profile }: { profile: MatchProfile }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-[#252b27] rounded-2xl p-6 shadow-sm border border-green-700/30"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-900/40 flex items-center justify-center">
          <FaUserAlt className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{profile.username}</h3>
            <span className="text-green-400 font-medium">{profile.match_percentage}% match</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {profile.primary_skill && (
          <span className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-sm">
            {profile.primary_skill}
          </span>
        )}
        {profile.secondary_skill && (
          <span className="px-3 py-1 bg-green-900/40 text-green-400 rounded-full text-sm">
            {profile.secondary_skill}
          </span>
        )}
        {profile.learning_goal && (
          <span className="px-3 py-1 bg-purple-900/40 text-purple-400 rounded-full text-sm">
            Wants to learn: {profile.learning_goal}
          </span>
        )}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => handleSwipe(profile.id, false)}
          className="px-4 py-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 flex items-center gap-2"
        >
          <FaTimes /> Pass
        </button>
        <button
          onClick={() => handleSwipe(profile.id, true)}
          className="px-4 py-2 bg-green-900/20 text-green-400 rounded-lg hover:bg-green-900/30 flex items-center gap-2"
        >
          Like <FaCheck />
        </button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-300">Finding your perfect matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && mentors.length === 0 && mentees.length === 0) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-8 bg-[#252b27] rounded-xl border border-red-700/30">
            <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Finding Matches</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchMatches}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      {matchNotification && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-green-900/90 p-4 rounded-xl border border-green-500 text-center max-w-md"
          >
            <FaCheck className="inline-block text-green-400 mr-2" />
            <span className="text-white font-medium">
              It's a match with {matchNotification.username}! You can now message each other.
            </span>
            <div className="mt-2">
              <button 
                onClick={() => navigate('/messages')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
              >
                Start Chatting
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by skills, username, or learning goals..."
                  className="w-full pl-12 pr-4 py-3 bg-[#252b27] border border-green-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button 
                onClick={fetchMatches}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaFilter />
                Refresh Matches
              </button>
            </div>

            {filteredMentors.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">People Who Can Teach You</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredMentors.map(mentor => (
                    <MatchCard key={mentor.id} profile={mentor} />
                  ))}
                </div>
              </section>
            )}

            {filteredMentees.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">People You Can Teach</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredMentees.map(mentee => (
                    <MatchCard key={mentee.id} profile={mentee} />
                  ))}
                </div>
              </section>
            )}

            {filteredMentors.length === 0 && filteredMentees.length === 0 && (
              <div className="bg-[#252b27] rounded-2xl p-8 shadow-sm border border-yellow-700/30 text-center">
                <h2 className="text-xl font-semibold text-white mb-4">No Matches Found</h2>
                <p className="text-gray-300 mb-6">
                  {searchTerm ? 'No matches found for your search criteria.' : 'You\'ve reviewed all potential matches!'}
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    fetchMatches();
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {searchTerm ? 'Clear Search' : 'Refresh Matches'}
                </button>
              </div>
            )}

            <motion.section
              whileHover={{ scale: 1.01 }}
              className="bg-[#252b27] rounded-2xl p-6 shadow-sm border border-green-700/30"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white mb-4">
                <FaLightbulb className="text-green-400" />
                Why these matches?
              </h2>
              <p className="text-gray-300">
                Our matching system finds people whose skills align with your learning goals, and whose 
                learning goals match your skills. Swipe right on profiles you like, and if they like you 
                back, it's a match! You'll be able to message each other and arrange knowledge sharing sessions.
              </p>
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Matchmaking;
