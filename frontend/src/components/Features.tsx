import { motion } from 'framer-motion'; 
import React from 'react';

const Features = () => {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Empowering Your Learning Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Discover a new way of learning through skill exchange and community collaboration
          </motion.p>
        </div>

        {/* Skill Exchange Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="relative">
            {/* Main Exchange Card */}
            <div className="relative bg-[#252b27] rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-green-700/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Left Person Card */}
                <div className="flex-1 bg-[#1f2421] rounded-xl p-6 text-center border border-green-700/20">
                  <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">React Developer</h3>
                  <p className="text-gray-300 mt-2">Wants to Learn</p>
                  <div className="mt-3 inline-block px-4 py-2 bg-green-400/10 rounded-full">
                    <span className="text-green-400">Three.js</span>
                  </div>
                </div>

                {/* Exchange Arrow */}
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-green-400 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-sm text-gray-300 mt-2">Perfect Match!</span>
                </div>

                {/* Right Person Card */}
                <div className="flex-1 bg-[#1f2421] rounded-xl p-6 text-center border border-green-700/20">
                  <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Three.js Developer</h3>
                  <p className="text-gray-300 mt-2">Wants to Learn</p>
                  <div className="mt-3 inline-block px-4 py-2 bg-green-400/10 rounded-full">
                    <span className="text-green-400">React</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-gray-300">
                  Our AI-powered matching system connects you with the perfect skill exchange partner
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200"
                >
                  Find Your Match
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;