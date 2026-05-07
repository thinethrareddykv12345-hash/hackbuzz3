import { motion } from 'framer-motion';
import { FiPlus, FiFolder } from 'react-icons/fi';

const Projects = () => {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-dark-400 mt-2">Manage your group projects and tracks progress.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <FiPlus /> New Project
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 glass-card-hover cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary-600/20 text-primary-400">
                <FiFolder size={24} />
              </div>
              <span className="px-2 py-1 rounded-md bg-green-900/30 text-green-400 text-[10px] font-bold border border-green-800/50 uppercase">Active</span>
            </div>
            <h3 className="text-xl font-bold text-white">Project Phoenix</h3>
            <p className="text-sm text-dark-400 mt-2 line-clamp-2">
              Building a state-of-the-art AI collaboration platform with real-time insights and ethical feedback.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((u) => (
                  <div key={u} className="w-8 h-8 rounded-full border-2 border-dark-900 bg-primary-700 flex items-center justify-center text-[10px] font-bold">U{u}</div>
                ))}
              </div>
              <span className="text-xs text-dark-500">Updated 2h ago</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
