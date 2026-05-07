import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiClock, FiCode, FiExternalLink, FiCpu, FiBarChart2, FiUsers, FiPaperclip } from 'react-icons/fi';

const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const { accessToken, user: currentUser } = useSelector((state) => state.auth);
  
  const [project, setProject] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ description: '', category: 'backend', githubLink: '', hoursSpent: 1 });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, contRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/contributions/project/${projectId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);
        setProject(projRes.data.data.project);
        setContributions(contRes.data.data.contributions);
      } catch (err) {
        console.error('Failed to fetch project data', err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchData();
  }, [projectId, accessToken]);

  const handleLogContribution = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const data = new FormData();
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('projectId', projectId);
    data.append('githubLink', formData.githubLink);
    data.append('hoursSpent', formData.hoursSpent);
    files.forEach(file => data.append('files', file));

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/contributions`, data, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setContributions([res.data.data.contribution, ...contributions]);
      toast.success('Contribution logged and AI analysis started!');
      setIsModalOpen(false);
      setFormData({ description: '', category: 'backend', githubLink: '', hoursSpent: 1 });
      setFiles([]);
    } catch (err) {
      toast.error('Failed to log contribution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-400 font-bold tracking-widest animate-pulse uppercase">Syncing Workspace...</div>;

  if (!project) return (
    <div className="text-center py-20 glass-card mx-auto max-w-lg mt-20">
      <p className="text-dark-400 italic">Project workspace is currently unavailable or was not found.</p>
      <Link to="/projects" className="btn-primary mt-6 inline-block px-8">Back to Projects</Link>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded bg-primary-600/20 text-primary-400 text-[10px] font-bold uppercase tracking-widest border border-primary-500/30">Active Sprint</span>
            <span className="text-dark-500 text-xs">Started {new Date(project.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-white">{project.title}</h1>
            <div 
              className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 flex items-center gap-2 group cursor-pointer hover:border-primary-500/50 transition-all"
              onClick={() => {
                navigator.clipboard.writeText(project.team?.inviteCode);
                toast.success('Invite code copied to clipboard!');
              }}
              title="Click to copy invite code"
            >
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Invite Code:</span>
              <span className="text-sm font-mono font-bold text-primary-400">{project.team?.inviteCode || 'N/A'}</span>
            </div>
          </div>
          <p className="text-dark-400 mt-2 max-w-2xl">{project.description}</p>
        </div>
        
        <div className="flex gap-3">
          <Link to={`/analytics/${projectId}`} className="btn-secondary flex items-center gap-2">
            <FiBarChart2 /> Analytics
          </Link>
          <Link to={`/feedback/${projectId}`} className="btn-secondary flex items-center gap-2">
            <FiUsers /> Feedback
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Log Work
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiClock className="text-primary-400" /> Contribution Timeline
          </h2>
          
          <div className="space-y-6">
            {contributions.map((contribution) => (
              <motion.div 
                key={contribution._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white shadow-lg">
                      {contribution.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{contribution.user?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-dark-500 uppercase tracking-widest">{new Date(contribution.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-dark-300 font-bold uppercase">
                    {contribution.category}
                  </span>
                </div>
                
                <p className="text-dark-200 text-sm leading-relaxed mb-4">{contribution.description}</p>
                
                <div className="flex flex-wrap gap-3 items-center">
                  {contribution.githubLink && (
                    <a href={contribution.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                      <FiCode /> Code Commit <FiExternalLink size={10} />
                    </a>
                  )}
                  {contribution.attachments?.map((file, i) => (
                    <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 transition-colors">
                      <FiPaperclip /> {file.fileName}
                    </a>
                  ))}
                </div>

                {/* AI Insights Snippet */}
                {contribution.aiAnalysis && (
                  <div className="mt-4 p-4 rounded-xl bg-primary-900/10 border border-primary-500/10 flex items-start gap-3">
                    <div className="p-1.5 rounded bg-primary-500/20 text-primary-400">
                      <FiCpu size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">AI Intelligence Insight</p>
                      <p className="text-xs text-dark-300 italic">"{contribution.aiAnalysis.feedback}"</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[9px] text-dark-500">Effort: <span className="text-white">{contribution.aiAnalysis.effortScore}/10</span></span>
                        <span className="text-[9px] text-dark-500">Impact: <span className="text-white">{contribution.aiAnalysis.qualityScore}/10</span></span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack?.map(tech => (
                <span key={tech} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-dark-300">{tech}</span>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Collaborators</h3>
            <div className="space-y-4">
              {project.team?.members?.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-dark-300">
                      {member.user.name.charAt(0)}
                    </div>
                    <span className="text-sm text-dark-200">{member.user.name}</span>
                  </div>
                  <span className="text-[10px] text-dark-500 uppercase tracking-widest">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 w-full max-w-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Log Your Contribution</h2>
              <form onSubmit={handleLogContribution} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">What did you work on?</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your 2-3 line contribution..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none"
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="testing">Testing</option>
                      <option value="documentation">Documentation</option>
                      <option value="deployment">Deployment</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">Hours Spent</label>
                    <input 
                      type="number"
                      value={formData.hoursSpent}
                      onChange={(e) => setFormData({...formData, hoursSpent: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">GitHub Commit Link (Optional)</label>
                  <input 
                    type="url"
                    value={formData.githubLink}
                    onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
                    placeholder="https://github.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-2">Upload Proof (Screenshots/Docs)</label>
                  <input 
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="w-full text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Syncing with AI...' : 'Submit Contribution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;
