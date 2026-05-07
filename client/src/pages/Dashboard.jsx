import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FiTrendingUp, FiUsers, FiCheckCircle, FiActivity, FiLayers, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects/my`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setProjects(res.data.data.projects);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [accessToken]);

  const dashboardStats = [
    { label: 'Team Health', value: '92%', icon: FiActivity, color: 'text-green-400' },
    { label: 'Active Projects', value: projects.length.toString(), icon: FiLayers, color: 'text-primary-400' },
    { label: 'Contributions', value: '154', icon: FiCheckCircle, color: 'text-yellow-400' },
    { label: 'Avg. Effort', value: '8.2', icon: FiTrendingUp, color: 'text-accent-400' },
  ];

  if (loading) return <div className="text-center py-20 text-dark-400">Loading your pulse...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}! 👋</h1>
          <p className="text-dark-400 mt-2">Here's what's happening with your teams today.</p>
        </div>
        <Link to="/projects" className="btn-primary flex items-center gap-2">
          View All Projects <FiArrowRight />
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 glass-card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Your Projects</h2>
            <Link to="/projects" className="text-xs font-bold text-primary-400 uppercase tracking-widest hover:text-primary-300">See All</Link>
          </div>
          
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <Link 
                  to={`/projects/${project._id}`} 
                  key={project._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold">
                      {project.title.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold group-hover:text-primary-400 transition-colors">{project.title}</p>
                      <p className="text-xs text-dark-500">{project.team?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-300 font-bold uppercase tracking-widest">{project.status}</p>
                    <p className="text-[10px] text-dark-500 mt-1">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-dark-400 text-sm">No active projects found. Create one to get started!</p>
              <Link to="/projects" className="btn-secondary mt-4 inline-block">Create Project</Link>
            </div>
          )}
        </div>

        {/* AI Insights Sidebar */}
        <div className="glass-card p-8 bg-gradient-to-br from-white/5 to-accent-900/10">
          <h2 className="text-xl font-bold text-white mb-6">AI Feed</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary-900/20 border border-primary-500/20">
              <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Weekly Pulse</p>
              <p className="text-sm text-white/80">Your team is 15% more active than last week. Great momentum!</p>
            </div>
            
            <div className="p-4 rounded-xl bg-accent-900/20 border border-accent-500/20">
              <p className="text-xs font-bold text-accent-400 uppercase tracking-widest mb-1">Coach Insight</p>
              <p className="text-sm text-white/80">Backend tasks are piling up. Consider re-assigning documentation to balance the load.</p>
            </div>

            <div className="mt-4 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-dark-400">Weekly Goal</span>
                <span className="text-xs text-white">80%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[80%] bg-gradient-to-r from-primary-500 to-accent-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
