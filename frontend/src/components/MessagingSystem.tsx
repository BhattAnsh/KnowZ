import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserAlt, FaPaperPlane, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Match {
  id: string;
  username: string;
  last_message?: string;
  message_count: number;
  unread_count: number;
  max_messages: number;
}

const MessagingSystem: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('user_id');

  // Poll for new messages every 15 seconds
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      if (selectedMatch) {
        fetchMessages(selectedMatch);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch);
    }
  }, [selectedMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.get('http://localhost:8088/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.matches) {
        setMatches(response.data.matches);
        if (response.data.matches.length > 0 && !selectedMatch) {
          setSelectedMatch(response.data.matches[0].id);
          setSelectedUsername(response.data.matches[0].username);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to load matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      console.log(`Fetching messages for match ID: ${matchId}`);
      
      const response = await axios.get(`http://localhost:8088/messages/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Messages API response:", response.data);
      
      if (response.data.messages) {
        setMessages(response.data.messages);
        console.log(`Loaded ${response.data.messages.length} messages`);
        
        // Update match username and unread count
        const matchInfo = matches.find(m => m.id === matchId);
        if (matchInfo) {
          setSelectedUsername(matchInfo.username);
          
          // Update matches to mark messages as read
          setMatches(prevMatches => 
            prevMatches.map(match => 
              match.id === matchId ? { ...match, unread_count: 0 } : match
            )
          );
        } else {
          console.warn(`Match info not found for ID: ${matchId}`);
        }
      } else {
        console.warn("No messages found in API response");
        setMessages([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching messages:", err);
      if (axios.isAxiosError(err)) {
        console.error("Response data:", err.response?.data);
        console.error("Status code:", err.response?.status);
      }
      
      // Set an empty messages array to avoid UI issues
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;
    
    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await axios.post(
        'http://localhost:8088/messages/send',
        {
          recipientId: selectedMatch,
          text: newMessage.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.message) {
        // Add the new message to the conversation
        setMessages(prev => [...prev, response.data.message]);
        
        // Update the match's message count
        setMatches(prevMatches => 
          prevMatches.map(match => 
            match.id === selectedMatch 
              ? { 
                  ...match, 
                  message_count: match.message_count + 1, 
                  last_message: newMessage.trim() 
                } 
              : match
          )
        );
        
        setNewMessage('');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        alert('Message limit reached for this match. Please exchange contact info to continue your conversation elsewhere.');
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageLimitInfo = () => {
    if (!selectedMatch) return null;
    
    const match = matches.find(m => m.id === selectedMatch);
    if (!match) return null;
    
    return {
      current: match.message_count,
      max: match.max_messages,
      remaining: match.max_messages - match.message_count
    };
  };

  if (loading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#171c19] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-300">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#171c19] p-6">
        <div className="max-w-md mx-auto bg-[#252b27] p-8 rounded-xl border border-red-700/30 text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button 
            onClick={fetchMatches}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#171c19] p-6">
        <div className="max-w-md mx-auto bg-[#252b27] p-8 rounded-xl border border-green-700/30 text-center">
          <div className="h-20 w-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUserAlt className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
          <p className="text-gray-300 mb-8">
            You don't have any matches yet. Start swiping to find your perfect knowledge exchange partners!
          </p>
          <button 
            onClick={() => navigate('/match')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Find Matches
          </button>
        </div>
      </div>
    );
  }

  const limitInfo = getMessageLimitInfo();

  return (
    <div className="min-h-screen bg-[#171c19]">
      <div className="h-full max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-white mb-6">Your Conversations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-150px)]">
          {/* Match list sidebar */}
          <div className="md:col-span-1 bg-[#252b27] rounded-xl border border-green-700/30 overflow-hidden">
            <div className="p-4 border-b border-green-700/30">
              <h3 className="text-lg font-medium text-white">Matches</h3>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {matches.map(match => (
                <button
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match.id);
                    setSelectedUsername(match.username);
                  }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-green-900/20 transition-colors ${
                    selectedMatch === match.id ? 'bg-green-900/30' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-green-900/40 flex items-center justify-center flex-shrink-0">
                    <FaUserAlt className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-white truncate">{match.username}</h4>
                      {match.unread_count > 0 && (
                        <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {match.unread_count}
                        </span>
                      )}
                    </div>
                    {match.last_message && (
                      <p className="text-gray-400 text-sm truncate">{match.last_message}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="md:col-span-2 bg-[#252b27] rounded-xl border border-green-700/30 flex flex-col overflow-hidden">
            {selectedMatch ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-green-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-900/40 flex items-center justify-center">
                      <FaUserAlt className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="font-medium text-white">{selectedUsername}</h3>
                  </div>
                  
                  {limitInfo && (
                    <div className="text-sm">
                      <span className={limitInfo.remaining <= 2 ? 'text-yellow-400' : 'text-gray-400'}>
                        {limitInfo.current}/{limitInfo.max} messages
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Message limit warning */}
                {limitInfo && limitInfo.remaining <= 2 && limitInfo.remaining > 0 && (
                  <div className="bg-yellow-900/20 border-b border-yellow-700/30 px-4 py-2 flex items-center gap-2">
                    <FaInfoCircle className="text-yellow-500" />
                    <span className="text-sm text-yellow-400">
                      Only {limitInfo.remaining} message{limitInfo.remaining !== 1 ? 's' : ''} remaining before limit is reached.
                    </span>
                  </div>
                )}
                
                {limitInfo && limitInfo.remaining === 0 && (
                  <div className="bg-red-900/20 border-b border-red-700/30 px-4 py-2 flex items-center gap-2">
                    <FaInfoCircle className="text-red-500" />
                    <span className="text-sm text-red-400">
                      Message limit reached. Exchange contact info to continue conversation elsewhere.
                    </span>
                  </div>
                )}
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1f2421]/30">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Start a conversation with {selectedUsername}</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div 
                        key={message.id}
                        className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* If it's a received message, add the avatar */}
                        {message.senderId !== currentUserId && (
                          <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                            <FaUserAlt className="h-3 w-3 text-green-400" />
                          </div>
                        )}
                        
                        {/* The message bubble */}
                        <div 
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderId === currentUserId 
                              ? 'bg-green-700/60 text-white rounded-tr-none' 
                              : 'bg-gray-700/50 text-gray-100 rounded-tl-none'
                          }`}
                        >
                          <p className="break-words">{message.text}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            
                            {/* Read receipts for sent messages */}
                            {message.senderId === currentUserId && (
                              <span className="text-xs ml-2">
                                {message.isRead 
                                  ? <span className="text-green-300">✓✓</span> 
                                  : <span className="text-gray-400">✓</span>}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* If it's a sent message, add spacing on the right for balance */}
                        {message.senderId === currentUserId && (
                          <div className="w-8 flex-shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-green-700/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={limitInfo?.remaining === 0 ? "Message limit reached" : "Type a message..."}
                      disabled={limitInfo?.remaining === 0 || sendingMessage}
                      className="flex-1 bg-[#1f2421] border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || limitInfo?.remaining === 0 || sendingMessage}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;