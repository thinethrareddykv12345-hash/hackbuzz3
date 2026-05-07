import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiLogOut, FiBell, FiSettings, FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black gradient-text tracking-tighter">TEAM PULSE AI</h1>
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 w-64 text-dark-400">
            <FiSearch size={16} />
            <span className="text-xs">Search projects...</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-dark-300 hover:text-white transition-colors relative">
            <FiBell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full border-2 border-dark-950"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-widest">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/20">
              {user?.name?.charAt(0)}
            </div>
            <button 
              onClick={() => dispatch(logout())}
              className="p-2 text-dark-300 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
