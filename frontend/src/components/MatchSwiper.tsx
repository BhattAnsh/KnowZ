import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserAlt, FaCheck, FaTimes, FaCheckCircle, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface MatchCandidate {
  user_id: string;
  username: string;
  match_score: number;
  matching_skills: { _id: string; name: string }[];
  matching_goals: { _id: string; name: string }[];
  match_percentage: number;
}

const MatchSwiper: React.FC = () => {
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatchCandidates();
  }, []);

  const fetchMatchCandidates = async () => {
    setLoading(true);
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
        setCandidates(response.data.matches);
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

  const handleSwipe = async (liked: boolean) => {
    if (currentIndex >= candidates.length) return;
    
    const candidate = candidates[currentIndex];
    setSwipeDirection(liked ? 'right' : 'left');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8088/swipe',
        {
          target_user_id: candidate.user_id,
          liked
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.is_match) {
        setShowMatch(true);
        setTimeout(() => {
          setShowMatch(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Error recording swipe:", err);
    }

    // Move to next candidate after animation completes
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171c19] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-300">Finding potential skill matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#171c19] p-6">
        <div className="max-w-md mx-auto bg-[#252b27] p-8 rounded-xl border border-green-700/30 text-center">
          <div className="text-red-400 mb-4 text-4xl">😕</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Matches Found</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchMatchCandidates}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-[#1f2421] hover:bg-gray-800 text-white rounded-lg"
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= candidates.length) {
    return (
      <div className="min-h-screen bg-[#171c19] p-6">
        <div className="max-w-md mx-auto bg-[#252b27] p-8 rounded-xl border border-green-700/30 text-center">
          <div className="text-green-400 mb-4 text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">You're All Caught Up!</h2>
          <p className="text-gray-300 mb-6">You've gone through all potential matches.</p>
          <button
            onClick={() => {
              fetchMatchCandidates();
              setCurrentIndex(0);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg mr-2"
          >
            Find More Matches
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="px-4 py-2 bg-[#1f2421] hover:bg-gray-800 text-white rounded-lg"
          >
            View Messages
          </button>
        </div>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="min-h-screen bg-[#171c19] p-6">
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-x-0 top-20 z-50 mx-auto max-w-sm bg-green-900/80 p-4 rounded-xl border border-green-500 text-center"
          >
            <FaCheckCircle className="inline-block mr-2 text-green-400" />
            <span className="text-white font-medium">It's a match! You can now message each other.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Find Knowledge Partners</h2>
        
        <div className="relative h-[500px]">
          <AnimatePresence>
            <motion.div
              key={currentCandidate.user_id}
              initial={{ opacity: 1 }}
              animate={{ 
                x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
                opacity: swipeDirection ? 0 : 1,
                rotate: swipeDirection === 'left' ? -10 : swipeDirection === 'right' ? 10 : 0
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#252b27] rounded-2xl shadow-lg overflow-hidden border border-green-700/30"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-900/40 flex items-center justify-center">
                      <FaUserAlt className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentCandidate.username}</h3>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/30 px-3 py-1 rounded-full flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-white font-bold">{currentCandidate.match_percentage}%</span>
                  </div>
                </div>

                <div className="bg-[#1f2421] rounded-xl p-4 mb-4">
                  <h4 className="text-green-400 font-medium mb-2">They can teach you:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentCandidate.matching_skills.map((skill, index) => (
                      <span key={index} className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded-md text-sm">
                        {skill.name || skill._id.split('/')[1]}
                      </span>
                    ))}
                    {currentCandidate.matching_skills.length === 0 && (
                      <span className="text-gray-400 text-sm">No direct skill matches</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#1f2421] rounded-xl p-4 mb-8">
                  <h4 className="text-green-400 font-medium mb-2">You can teach them:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentCandidate.matching_goals.map((skill, index) => (
                      <span key={index} className="bg-green-900/30 text-green-400 px-2 py-1 rounded-md text-sm">
                        {skill.name || skill._id.split('/')[1]}
                      </span>
                    ))}
                    {currentCandidate.matching_goals.length === 0 && (
                      <span className="text-gray-400 text-sm">No direct skill matches</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => handleSwipe(false)}
                    className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center hover:bg-red-600/30 transition-colors"
                  >
                    <FaTimes className="w-8 h-8" />
                  </button>
                  
                  <button
                    onClick={() => handleSwipe(true)}
                    className="w-16 h-16 rounded-full bg-green-600/20 text-green-500 flex items-center justify-center hover:bg-green-600/30 transition-colors"
                  >
                    <FaCheck className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400">Swipe right to connect, swipe left to pass</p>
          <p className="text-gray-500 text-sm mt-2">
            Match {currentIndex + 1} of {candidates.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchSwiper;