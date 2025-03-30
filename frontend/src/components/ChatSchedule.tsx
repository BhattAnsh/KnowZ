import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserCircle, FaPaperclip, FaMicrophone, FaPaperPlane, 
  FaCalendarAlt, FaClock, FaVideo, FaSearch, FaEllipsisV 
} from 'react-icons/fa';
import Navbar from './Navbar';

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'voice';
}

interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
    status: 'online' | 'offline';
    lastSeen?: string;
  };
  lastMessage: string;
  unread: number;
}

interface Session {
  id: number;
  mentor: string;
  title: string;
  dateTime: string;
  duration: string;
  status: 'upcoming' | 'completed';
}

const ChatSchedule = () => {
  const [activeConversation, setActiveConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations: Conversation[] = [
    {
      id: 1,
      user: {
        id: 1,
        name: "John Doe",
        status: 'online',
      },
      lastMessage: "Let's schedule a React session",
      unread: 2,
    },
    // ...more conversations
  ];

  const messages: Message[] = [
    {
      id: 1,
      senderId: 1,
      content: "Hi! I'd like to learn more about React hooks.",
      timestamp: "10:30 AM",
      type: 'text',
    },
    // ...more messages
  ];

  const upcomingSessions: Session[] = [
    {
      id: 1,
      mentor: "Sarah Johnson",
      title: "Advanced React Patterns",
      dateTime: "Tomorrow at 2:00 PM",
      duration: "1 hour",
      status: 'upcoming',
    },
    // ...more sessions
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Inbox Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-4rem)]">
                {conversations.map(conv => (
                  <motion.div
                    key={conv.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                      activeConversation === conv.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {conv.user.avatar ? (
                        <img src={conv.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {conv.user.name}
                          </h3>
                          {conv.unread > 0 && (
                            <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              {activeConversation ? (
                <>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaUserCircle className="w-10 h-10 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {conversations.find(c => c.id === activeConversation)?.user.name}
                        </h3>
                        <span className="text-sm text-green-500">Online</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <FaEllipsisV className="text-gray-500" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 1 ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.senderId === 1
                              ? 'bg-gray-100 dark:bg-gray-700'
                              : 'bg-indigo-500 text-white'
                          }`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <FaPaperclip />
                      </button>
                      <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <FaMicrophone />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2"
                      />
                      <button className="p-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600">
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </motion.div>

            {/* Schedule & Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 flex flex-col gap-6"
            >
              {/* Schedule Session Button */}
              <button className="w-full bg-indigo-500 text-white rounded-xl p-4 hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                <FaCalendarAlt />
                Schedule New Session
              </button>

              {/* Upcoming Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Upcoming Sessions
                </h3>
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        with {session.mentor}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-indigo-500">
                          <FaClock className="text-xs" />
                          {session.dateTime}
                        </span>
                        <button className="flex items-center gap-1 text-green-500">
                          <FaVideo />
                          Join
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatSchedule;
