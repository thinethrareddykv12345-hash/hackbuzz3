import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUsers, FiCopy, FiUserPlus, FiLayers } from 'react-icons/fi';

const TeamDetails = () => {
  const { id: teamId } = useParams();
  const { accessToken } = useSelector((state) => state.auth);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setTeam(res.data.data.team);
      } catch (err) {
        console.error('Failed to fetch team', err);
      } finally {
        setLoading(false);
      }
    };
    if (teamId) fetchTeam();
  }, [teamId, accessToken]);

  const copyInviteCode = () => {
    if (!team?.inviteCode) return;
    navigator.clipboard.writeText(team.inviteCode);
    toast.success('Invite code copied to clipboard!');
  };

  if (loading) return <div className="text-center py-20 text-dark-400">Loading Team Roster...</div>;
  if (!team) return <div className="text-center py-20 text-dark-400">Team not found.</div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{team.name}</h1>
          <p className="text-dark-400 mt-2">Manage your squad and project collaboration.</p>
        </div>
        <div onClick={copyInviteCode} className="glass-card px-4 py-2 flex items-center gap-3 cursor-pointer hover:border-primary-500/50 transition-all w-fit">
          <div className="text-right">
            <p className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">Invite Code</p>
            <p className="text-sm font-mono text-primary-400 font-bold">{team.inviteCode}</p>
          </div>
          <FiCopy className="text-dark-400" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiUsers className="text-primary-400" /> Members ({team.members.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.members.map((member) => (
                <div key={member.user._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center font-bold text-white shadow-lg">
                    {member.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member.user.name}</p>
                    <p className="text-xs text-dark-400">{member.user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-primary-900/30 text-primary-400 text-[9px] font-bold uppercase tracking-widest border border-primary-500/20">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiLayers className="text-accent-400" /> Linked Projects
            </h3>
            <div className="space-y-3">
              {team.projects?.map(project => (
                <div key={project._id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-accent-500/30 transition-all cursor-pointer">
                  <p className="text-sm font-semibold text-white">{project.title}</p>
                  <p className="text-xs text-dark-500 mt-1 line-clamp-1">{project.description}</p>
                </div>
              ))}
              {(!team.projects || team.projects.length === 0) && (
                <p className="text-xs text-dark-500 italic">No projects linked to this team yet.</p>
              )}
            </div>
          </div>

          <button className="w-full btn-primary flex items-center justify-center gap-2">
            <FiUserPlus /> Invite Teammates
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
