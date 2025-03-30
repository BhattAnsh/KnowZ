import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaTools } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { register, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse skills into primary_skill, secondary_skill, and learning_goal
      const skillsArray = formData.skills.split(',').map(s => s.trim());
      
      await register({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        primary_skill: skillsArray[0],
        secondary_skill: skillsArray[1],
        learning_goal: skillsArray[2]
      });
      
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in context
      console.error('Registration failed:', err);
    }
  };

  const goToLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 w-full max-w-md mx-auto bg-[#252b27] p-8 rounded-xl shadow-md border border-green-700/30"
      > 
        <h2 className="text-2xl font-bold text-center text-white">Create Your KnowZ Account</h2>
        {error && <div className="bg-red-900/20 text-red-400 p-3 rounded-lg">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200">
              Full Name
            </label>
            <div className="mt-1 relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-[#1f2421] text-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Email address
            </label>
            <div className="mt-1 relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-[#1f2421] text-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Password
            </label>
            <div className="mt-1 relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-[#1f2421] text-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-200">
              Skills (comma separated)
            </label>
            <div className="mt-1 relative">
              <FaTools className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="skills"
                name="skills"
                type="text"
                placeholder="e.g., React, Python, UX Design"
                value={formData.skills}
                onChange={handleChange}
                className="pl-10 block w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-[#1f2421] text-white"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">First skill: what you teach, Second: alternate skill, Third: what you want to learn</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="text-center">
          <button onClick={goToLogin} className="text-green-400 hover:text-green-300">
            Already have an account? Sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
