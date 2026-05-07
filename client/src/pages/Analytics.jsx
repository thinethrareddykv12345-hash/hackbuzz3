import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const Analytics = () => {
  const { id: projectId } = useParams();
  const { accessToken } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/project/${projectId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchAnalytics();
  }, [projectId, accessToken]);

  if (loading) return <div className="text-center py-20 text-dark-400">Loading AI Insights...</div>;
  if (!data) return <div className="text-center py-20 text-dark-400">No data available for this project yet.</div>;

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white">Project Intelligence</h1>
        <p className="text-dark-400 mt-2">AI-driven analysis of team contributions and productivity.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-primary-500">
          <p className="text-sm text-dark-400 uppercase tracking-wider">Total Contributions</p>
          <p className="text-3xl font-bold text-white mt-1">{data.totalContributions}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-accent-500">
          <p className="text-sm text-dark-400 uppercase tracking-wider">Avg. Effort Score</p>
          <p className="text-3xl font-bold text-white mt-1">7.4/10</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-green-500">
          <p className="text-sm text-dark-400 uppercase tracking-wider">Team Balance</p>
          <p className="text-3xl font-bold text-white mt-1">Balanced</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contribution Distribution */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-white mb-6">Member Contribution %</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.members}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="user.name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="totalContributions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-white mb-6">Work Categories</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(data.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(data.categoryBreakdown).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-4">
              {Object.keys(data.categoryBreakdown).map((cat, i) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[10px] text-dark-300 capitalize font-medium">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="glass-card p-8 bg-gradient-to-br from-white/5 to-primary-900/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
            <FiActivity size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">AI Team Pulse</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <FiCheckCircle className="text-green-400 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Productivity Spike</p>
                <p className="text-xs text-dark-400 mt-1">The team completed 24% more backend tasks this week compared to last. High momentum detected.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <FiAlertTriangle className="text-yellow-400 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Imbalance Warning</p>
                <p className="text-xs text-dark-400 mt-1">Frontend work is currently concentrated on a single member. Consider redistributing design reviews.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-primary-900/20 border border-primary-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FiInfo className="text-primary-400" />
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Next Recommendation</span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              "Based on current velocity, the team is on track to finish the MVP 2 days early. AI suggests spending tomorrow on <strong>Documentation</strong> to maintain high project quality."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
