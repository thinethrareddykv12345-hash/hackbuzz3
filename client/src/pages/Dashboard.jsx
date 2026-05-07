import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiTrendingUp, FiUsers, FiCheckCircle, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const stats = [
    { label: 'Team Health', value: '92%', icon: FiActivity, color: 'text-green-400' },
    { label: 'Active Projects', value: '3', icon: FiTrendingUp, color: 'text-primary-400' },
    { label: 'Teammates', value: '12', icon: FiUsers, color: 'text-accent-400' },
    { label: 'Contributions', value: '154', icon: FiCheckCircle, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}! 👋</h1>
        <p className="text-dark-400 mt-2">Here's what's happening with your teams today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
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
        <div className="lg:col-span-2 glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 border-b border-white/5 pb-6 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">JD</div>
                <div>
                  <p className="text-white font-medium">Logged a contribution in <span className="text-primary-400">Project Phoenix</span></p>
                  <p className="text-sm text-dark-400 mt-1">"Implemented the AI analysis pipeline and optimized MongoDB queries for faster retrieval."</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-primary-900/30 text-primary-400 border border-primary-800/50">Backend</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-accent-900/30 text-accent-400 border border-accent-800/50">AI Integration</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6">AI Insights</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary-900/20 border border-primary-500/20">
              <p className="text-sm text-primary-300 font-medium">Weekly Progress</p>
              <p className="text-xs text-primary-100/70 mt-1">Your team is 15% more active than last week. Great momentum!</p>
            </div>
            <div className="p-4 rounded-xl bg-accent-900/20 border border-accent-500/20">
              <p className="text-sm text-accent-300 font-medium">Collaboration Tip</p>
              <p className="text-xs text-accent-100/70 mt-1">Backend tasks are piling up. Consider re-assigning documentation to balance the load.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
