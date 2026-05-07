import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiStar, FiMessageSquare, FiShield, FiUser } from 'react-icons/fi';

const Feedback = () => {
  const { id: projectId } = useParams();
  const { accessToken, user: currentUser } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rating, setRating] = useState({ effort: 5, quality: 5, collaboration: 5 });
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, reviewRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/peer-reviews/project/${projectId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
        ]);
        setProject(projRes.data.data.project);
        setReviews(reviewRes.data.data.reviews);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchData();
  }, [projectId, accessToken, currentUser._id]);

  const handleSubmit = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/peer-reviews`, {
        projectId,
        revieweeId: selectedUser._id,
        ratings: rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success(`Review submitted for ${selectedUser.name}`);
      setSelectedUser(null);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-400">Loading Peer Network...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white">Peer Reflection</h1>
        <p className="text-dark-400 mt-2">Anonymous, constructive feedback to help your team grow.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Teammates List */}
        <div className="glass-card p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FiUser className="text-primary-400" /> Your Team
          </h3>
          <div className="space-y-4">
            {project?.team?.members?.filter(m => m.user._id !== currentUser._id).map((member) => (
              <button
                key={member.user._id}
                onClick={() => setSelectedUser(member.user)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  selectedUser?._id === member.user._id 
                    ? 'bg-primary-600/10 border-primary-500/50 text-white' 
                    : 'bg-white/5 border-white/5 text-dark-300 hover:border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center font-bold text-white">
                  {member.user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{member.user.name}</p>
                  <p className="text-[10px] text-dark-500 uppercase tracking-widest">{member.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Review Form or Received Feedback */}
        <div className="lg:col-span-2 space-y-8">
          {selectedUser ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <h3 className="text-xl font-bold text-white mb-2">Reviewing {selectedUser.name}</h3>
              <p className="text-sm text-dark-400 mb-8">All ratings are anonymous and summarized by AI.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {Object.keys(rating).map((key) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-3">{key}</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating({ ...rating, [key]: star })}
                          className={`p-2 rounded-lg transition-all ${
                            rating[key] >= star ? 'text-yellow-400 bg-yellow-400/10' : 'text-dark-600 bg-white/5'
                          }`}
                        >
                          <FiStar fill={rating[key] >= star ? 'currentColor' : 'none'} size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <label className="text-xs font-bold text-dark-300 uppercase tracking-widest block mb-3">Constructive Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did they do well? What could be improved?"
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary-500 transition-all"
                ></textarea>
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={() => setSelectedUser(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleSubmit} className="btn-primary">Submit Review</button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Your Insights</h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-500/20 text-green-400">
                  <FiShield size={14} />
                  <span className="text-[10px] font-bold uppercase">Privacy Guaranteed</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {/* Unified AI Reflection */}
                  <div className="p-8 rounded-3xl bg-primary-600/10 border border-primary-500/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FiCpu size={120} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                        <FiCpu size={20} />
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Team Consensus Reflection</span>
                    </div>
                    <p className="text-white text-lg italic leading-relaxed relative z-10">
                      "{reviews[0]?.aiSummary || 'Our AI is still processing the team consensus. Check back shortly for your unified reflection.'}"
                    </p>
                  </div>

                  <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.2em] mt-12 mb-4">Anonymized Constructive Feedback</h4>
                  <div className="space-y-4">
                    {reviews.filter(r => r.comment).map((rev, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3 text-primary-400">
                          <FiMessageSquare size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Teammate Note</span>
                        </div>
                        <p className="text-dark-300 text-sm leading-relaxed">{rev.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="p-4 rounded-full bg-white/5 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="text-dark-600" size={32} />
                  </div>
                  <p className="text-dark-400">No feedback received yet. AI summaries appear here after your teammates review your work.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
