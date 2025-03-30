import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  FaFire, FaQuestion, FaCode, FaUserCircle, FaComment, 
  FaHeart, FaTrophy, FaSearch 
} from 'react-icons/fa';
import Navbar from './Navbar';

interface ForumPost {
  id: number;
  title: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
}

interface Contributor {
  id: number;
  name: string;
  avatar?: string;
  reputation: number;
  contributions: number;
  topSkill: string;
}

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: <FaFire /> },
    { id: 'frontend', label: 'Frontend', icon: <FaCode /> },
    { id: 'backend', label: 'Backend', icon: <FaCode /> },
    { id: 'mobile', label: 'Mobile Dev', icon: <FaCode /> },
    { id: 'ai', label: 'AI/ML', icon: <FaCode /> },
  ];

  const discussions: ForumPost[] = [
    {
      id: 1,
      title: "Best practices for React hooks in 2024",
      author: { name: "Sarah Chen", reputation: 1250 },
      category: "frontend",
      tags: ["react", "javascript", "hooks"],
      likes: 45,
      comments: 12,
      timeAgo: "2h ago"
    },
    {
      id: 2,
      title: "Understanding Docker containerization",
      author: { name: "Mike Johnson", reputation: 890 },
      category: "backend",
      tags: ["docker", "devops", "containers"],
      likes: 32,
      comments: 8,
      timeAgo: "4h ago"
    },
  ];

  const topContributors: Contributor[] = [
    {
      id: 1,
      name: "Alex Rivera",
      reputation: 2500,
      contributions: 156,
      topSkill: "React",
    },
    {
      id: 2,
      name: "Emma Watson",
      reputation: 2100,
      contributions: 134,
      topSkill: "Python",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative w-full">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full md:w-auto px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaQuestion />
                Ask a Question
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Categories */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl text-left ${
                          selectedCategory === category.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Contributors */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    Top Contributors
                  </h3>
                  <div className="space-y-4">
                    {topContributors.map(contributor => (
                      <motion.div
                        key={contributor.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3"
                      >
                        {contributor.avatar ? (
                          <img src={contributor.avatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <FaUserCircle className="w-10 h-10 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{contributor.name}</h4>
                          <p className="text-sm text-gray-500">{contributor.topSkill}</p>
                        </div>
                        <div className="text-sm font-medium text-indigo-500">
                          {contributor.reputation}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Main Content - Discussions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-3 space-y-4"
              >
                {discussions.map(post => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 cursor-pointer">
                          {post.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <FaHeart className="text-pink-500" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <FaComment className="text-indigo-500" />
                            {post.comments}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{post.author.name}</span>
                          <FaUserCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-xs text-indigo-500 mt-1">
                          {post.author.reputation} rep
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Community;
