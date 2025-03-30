import { motion } from 'framer-motion';
import { FaUserCircle, FaGraduationCap, FaBookReader, FaEdit, FaPlus, FaRoad, FaExclamationTriangle, FaTrash, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios'; // Using axios directly for clearer error handling

const SkillProfile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: undefined,
    teachingSkills: [] as Array<{id: string, name: string, level: string}>,
    learningSkills: [] as Array<{id: string, name: string}>,
  });

  // Add skill form states
  const [addingTeachingSkill, setAddingTeachingSkill] = useState(false);
  const [addingLearningSkill, setAddingLearningSkill] = useState(false);
  const [newTeachingSkill, setNewTeachingSkill] = useState('');
  const [newLearningSkill, setNewLearningSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [addSkillError, setAddSkillError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skill levels for dropdown
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Make the API call to get profile data
      const response = await axios.get('http://localhost:8088/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API response:', response.data);

      // Extract data from the API response
      const { user, skills, learning_goals } = response.data;

      // Transform the API data to match our component's structure
      setProfileData({
        name: user.username || 'User',
        bio: user.bio || 'Skill matching enthusiast',
        avatar: user.avatar_url,
        // Map skills array to teachingSkills format
        teachingSkills: skills.map((skill: { id: string; name: string; category?: string }) => ({
          id: skill.id,
          name: skill.name,
          level: skill.category || 'Intermediate' // Use category as level or default
        })),
        // Map learning_goals array to learningSkills format  
        learningSkills: learning_goals.map((goal: { id: string; name: string }) => ({
          id: goal.id,
          name: goal.name
        }))
      });

      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      
      // Handle different error types
      if (err instanceof Error && axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 422) {
          setError('Your session has expired. Please login again.');
        } else if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data?.error || 'Unknown error'}`);
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError(err.message);
        }
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeachingSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeachingSkill.trim()) {
      setAddSkillError('Skill name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setAddSkillError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        'http://localhost:8088/add-skill',
        {
          skill_name: newTeachingSkill,
          skill_type: 'teaching',
          skill_level: skillLevel
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Add the new skill to the current state
      setProfileData(prev => ({
        ...prev,
        teachingSkills: [
          ...prev.teachingSkills,
          {
            id: response.data.skill.id,
            name: response.data.skill.name,
            level: response.data.skill.level || skillLevel
          }
        ]
      }));

      // Reset form
      setNewTeachingSkill('');
      setSkillLevel('Intermediate');
      setAddingTeachingSkill(false);

    } catch (err: unknown) {
      console.error('Error adding teaching skill:', err);
      if (err instanceof Error && axios.isAxiosError(err)) {
        setAddSkillError(err.response?.data?.error || 'Failed to add skill');
      } else {
        setAddSkillError('Failed to add skill. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLearningSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearningSkill.trim()) {
      setAddSkillError('Skill name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setAddSkillError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        'http://localhost:8088/add-skill',
        {
          skill_name: newLearningSkill,
          skill_type: 'learning'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Add the new skill to the current state
      setProfileData(prev => ({
        ...prev,
        learningSkills: [
          ...prev.learningSkills,
          {
            id: response.data.skill.id,
            name: response.data.skill.name
          }
        ]
      }));

      // Reset form
      setNewLearningSkill('');
      setAddingLearningSkill(false);

    } catch (err: unknown) {
      console.error('Error adding learning skill:', err);
      if (err instanceof Error && axios.isAxiosError(err)) {
        setAddSkillError(err.response?.data?.error || 'Failed to add skill');
      } else {
        setAddSkillError('Failed to add skill. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (skillId: string, skillType: 'teaching' | 'learning') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.post(
        'http://localhost:8088/remove-skill',
        {
          skill_id: skillId,
          skill_type: skillType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Remove the skill from the current state
      if (skillType === 'teaching') {
        setProfileData(prev => ({
          ...prev,
          teachingSkills: prev.teachingSkills.filter(skill => skill.id !== skillId)
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          learningSkills: prev.learningSkills.filter(skill => skill.id !== skillId)
        }));
      }

    } catch (err: unknown) {
      console.error(`Error removing ${skillType} skill:`, err);
      setError('Failed to remove skill. Please try again.');
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-transparent">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 p-8 rounded-xl text-center border border-red-500/30"
            >
              <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">Profile Error</h2>
              <p className="text-red-300 mb-6">{error}</p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent">
        <main className="p-6">
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-300">Loading your profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Main Content */}
      <main>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-[#252b27] rounded-2xl p-8 shadow-md border border-green-700/30"
            >
              <div className="flex items-center gap-6">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt={profileData.name} className="w-24 h-24 rounded-full object-cover border-2 border-green-500/30" />
                ) : (
                  <FaUserCircle className="w-24 h-24 text-green-400/60" />
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
                  <p className="mt-2 text-gray-300">{profileData.bio}</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
                  <FaEdit />
                  Edit Profile
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Teaching Skills */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-[#252b27] rounded-2xl p-6 shadow-md border border-green-700/30"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <FaGraduationCap className="text-blue-400" />
                    Skills I Can Teach
                  </h2>
                  <button 
                    onClick={() => {
                      setAddingTeachingSkill(true);
                      setAddingLearningSkill(false);
                      setAddSkillError(null);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>

                {/* Add Teaching Skill Form */}
                {addingTeachingSkill && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-4 border border-green-700/30 bg-green-900/20 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-green-400 font-medium">Add Teaching Skill</h3>
                      <button 
                        onClick={() => {
                          setAddingTeachingSkill(false);
                          setAddSkillError(null);
                        }}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    {addSkillError && (
                      <div className="mb-3 text-sm text-red-400">
                        {addSkillError}
                      </div>
                    )}
                    
                    <form onSubmit={handleAddTeachingSkill} className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Skill Name
                        </label>
                        <input
                          type="text"
                          value={newTeachingSkill}
                          onChange={(e) => setNewTeachingSkill(e.target.value)}
                          placeholder="e.g. JavaScript"
                          className="w-full p-2 border border-gray-600 rounded-lg bg-[#1f2421] text-white focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Skill Level
                        </label>
                        <select
                          value={skillLevel}
                          onChange={(e) => setSkillLevel(e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded-lg bg-[#1f2421] text-white focus:ring-green-500 focus:border-green-500"
                        >
                          {skillLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Adding...' : 'Add Skill'}
                      </button>
                    </form>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {profileData.teachingSkills.length > 0 ? (
                    profileData.teachingSkills.map(skill => (
                      <div
                        key={skill.id}
                        className="flex justify-between items-center p-3 border border-gray-700 rounded-xl hover:bg-[#1f2421]"
                      >
                        <span className="font-medium text-gray-200">{skill.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-blue-400">{skill.level}</span>
                          <button 
                            onClick={() => handleRemoveSkill(skill.id, 'teaching')}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No teaching skills added yet</p>
                      <button 
                        onClick={() => {
                          setAddingTeachingSkill(true);
                          setAddingLearningSkill(false);
                          setAddSkillError(null);
                        }}
                        className="mt-2 text-blue-400 hover:text-blue-300"
                      >
                        Add your first skill
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Learning Skills */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-[#252b27] rounded-2xl p-6 shadow-md border border-green-700/30"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <FaBookReader className="text-amber-400" />
                    Skills I Want to Learn
                  </h2>
                  <button 
                    onClick={() => {
                      setAddingLearningSkill(true);
                      setAddingTeachingSkill(false);
                      setAddSkillError(null);
                    }}
                    className="p-2 text-amber-400 hover:bg-amber-900/30 rounded-lg transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>

                {/* Add Learning Skill Form */}
                {addingLearningSkill && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-4 border border-green-700/30 bg-green-900/20 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-green-400 font-medium">Add Learning Goal</h3>
                      <button 
                        onClick={() => {
                          setAddingLearningSkill(false);
                          setAddSkillError(null);
                        }}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    {addSkillError && (
                      <div className="mb-3 text-sm text-red-400">
                        {addSkillError}
                      </div>
                    )}
                    
                    <form onSubmit={handleAddLearningSkill} className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Skill Name
                        </label>
                        <input
                          type="text"
                          value={newLearningSkill}
                          onChange={(e) => setNewLearningSkill(e.target.value)}
                          placeholder="e.g. React"
                          className="w-full p-2 border border-gray-600 rounded-lg bg-[#1f2421] text-white focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Adding...' : 'Add Skill'}
                      </button>
                    </form>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {profileData.learningSkills.length > 0 ? (
                    profileData.learningSkills.map(skill => (
                      <div
                        key={skill.id}
                        className="flex justify-between items-center p-3 border border-gray-700 rounded-xl hover:bg-[#1f2421]"
                      >
                        <span className="font-medium text-gray-200">{skill.name}</span>
                        <button 
                          onClick={() => handleRemoveSkill(skill.id, 'learning')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No learning goals added yet</p>
                      <button 
                        onClick={() => {
                          setAddingLearningSkill(true);
                          setAddingTeachingSkill(false);
                          setAddSkillError(null);
                        }}
                        className="mt-2 text-amber-400 hover:text-amber-300"
                      >
                        Add your first goal
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Learning Paths */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="lg:col-span-2 bg-[#252b27] rounded-2xl p-6 shadow-md border border-green-700/30"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-white">
                  <FaRoad className="text-green-400" />
                  Find Better Matches by Adding More Skills
                </h2>
                <p className="text-gray-300 mb-4">
                  The more skills you add to your profile, the better we can match you with learning partners.
                  Add both the skills you can teach and the ones you want to learn to find perfect skill exchange partners.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-blue-700/30 rounded-xl bg-blue-900/20">
                    <h3 className="font-medium text-blue-300 mb-2">Teaching Benefits</h3>
                    <p className="text-gray-300 text-sm">
                      Sharing your knowledge strengthens your own understanding and helps you build connections with
                      peers who are eager to learn from you.
                    </p>
                  </div>
                  <div className="p-4 border border-amber-700/30 rounded-xl bg-amber-900/20">
                    <h3 className="font-medium text-amber-300 mb-2">Learning Benefits</h3>
                    <p className="text-gray-300 text-sm">
                      Learn directly from peers who have hands-on experience with the skills you want to acquire,
                      creating a personalized learning journey.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SkillProfile;
