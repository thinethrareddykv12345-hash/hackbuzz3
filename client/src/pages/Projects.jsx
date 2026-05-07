import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFolder, FiX } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Projects = () => {
  const navigate = useNavigate();
  const { accessToken } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Project Form State
  const [formData, setFormData] = useState({ title: '', description: '', techStack: '' });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects/my`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setProjects(res.data.data.projects);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [accessToken]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/projects`, {
        ...formData,
        techStack: formData.techStack.split(',').map(s => s.trim())
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setProjects([res.data.data.project, ...projects]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', techStack: '' });
      toast.success('Project created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // ... previous useEffect ...

  const handleJoinProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/teams/join`, { inviteCode }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success('Successfully joined the team!');
      setIsJoinModalOpen(false);
      window.location.reload(); // Refresh to show new project
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite code');
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-400">Loading projects...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-dark-400 mt-2">Manage your group projects and tracks progress.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsJoinModalOpen(true)} className="btn-secondary flex items-center gap-2">
            Join with Code
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> New Project
          </button>
        </div>
      </header>

      {/* Join Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Join a Team</h2>
                <button onClick={() => setIsJoinModalOpen(false)} className="text-dark-400 hover:text-white"><FiX size={24} /></button>
              </div>
              <form onSubmit={handleJoinProject} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter Invite Code (e.g. ABC12345)" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white uppercase"
                  required 
                />
                <button type="submit" className="btn-primary w-full py-4">Join Project Room</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link to={`/projects/${project._id}`} key={project._id} className="block">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 glass-card-hover cursor-pointer h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary-600/20 text-primary-400">
                  <FiFolder size={24} />
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${
                  project.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'
                }`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{project.title}</h3>
              <p className="text-sm text-dark-400 mt-2 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.team?.members?.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-dark-900 bg-primary-700 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      {m.user?.name?.charAt(0) || 'U'}
                    </div>
                  ))}
                  {project.team?.members?.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-dark-900 bg-dark-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      +{project.team.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 glass-card">
          <p className="text-dark-400 italic">No projects found. Create your first one to start tracking contributions!</p>
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 w-full max-w-md relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">Project Title</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Project Phoenix"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief overview of the project goals..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">Tech Stack (comma separated)</label>
                  <input 
                    type="text"
                    value={formData.techStack}
                    onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full btn-primary">Create Project</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
