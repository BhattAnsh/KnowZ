import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
              Share Your Skills.
              <br />
              <span className="text-green-600 dark:text-green-400">
                Learn from Others.
              </span>
            </h1>
            <p className="mt-8 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect with people who want to share their expertise and learn new skills from others in your community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-8 py-4 rounded-full text-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
            >
              Start Teaching
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-8 py-4 rounded-full text-lg font-medium bg-stone-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-stone-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Start Learning
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;