import { NavLink } from 'react-router-dom';
import { FiGrid, FiLayers, FiUsers, FiPieChart, FiMessageSquare, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const menuItems = [
    { icon: FiGrid, label: 'Dashboard', path: '/' },
    { icon: FiLayers, label: 'Projects', path: '/projects' },
    { icon: FiPieChart, label: 'Analytics', path: '/analytics' },
    { icon: FiMessageSquare, label: 'Feedback', path: '/feedback' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-dark-950 border-r border-white/5 p-6 space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-3 mb-4">Navigation</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-900/10' 
                  : 'text-dark-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-8 mt-auto border-t border-white/5">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <FiSettings size={20} />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
