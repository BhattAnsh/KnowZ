import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import Login from './Login';
import Signup from './Signup';
import Navbar from './Navbar';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
    <Navbar />
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {showForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
          </motion.h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {showForgotPassword ? "Enter your email to reset password" : 
             (isLogin ? "Sign in to continue learning" : "Join our community today")}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showForgotPassword ? (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Reset Link
              </button>
              <div className="text-center">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Back to sign in
                </button>
              </div>
            </motion.form>
          ) : (
            isLogin ? (
              <Login 
                onToggleForm={() => setIsLogin(false)}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            ) : (
              <Signup onToggleForm={() => setIsLogin(true)} />
            )
          )}
        </AnimatePresence>
      </div>
    </section>
    </>
  );
};

export default Auth;
