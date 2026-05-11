import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function TopBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const xpPercent = user ? Math.round((user.xp / user.xpToNext) * 100) : 0;

  return (
    <header className="bg-[#111927] border-b border-[#1C2536] fixed top-0 w-full h-16 z-50 flex justify-between items-center px-6">
      <div className="flex items-center gap-8">
        <Link to="/lobby" className="text-xl font-black tracking-tighter text-[#9FEF00] uppercase neon-glow">
          SOC-Next
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/lobby" className="text-slate-400 hover:text-[#9FEF00] transition-colors text-sm font-semibold">
            לובי
          </Link>
          <Link to="/alerts" className="text-slate-400 hover:text-[#9FEF00] transition-colors text-sm font-semibold">
            התראות
          </Link>
          <Link to="/profile" className="text-slate-400 hover:text-[#9FEF00] transition-colors text-sm font-semibold">
            פרופיל
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden md:flex items-center gap-3">
            <div className="text-left">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                Level {user.level} · {user.xp.toLocaleString()} XP
              </div>
              <div className="w-32 h-1 bg-[#1C2536] rounded-full mt-1">
                <div
                  className="h-full bg-[#9FEF00] rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <button className="material-symbols-outlined text-slate-400 hover:text-[#9FEF00] transition-colors text-xl">
          notifications
        </button>
        <button
          onClick={handleSignOut}
          className="text-slate-400 hover:text-[#9FEF00] transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">logout</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#1C2536] border border-[#9FEF00]/40 flex items-center justify-center text-[#9FEF00] font-bold text-xs">
          {user?.name?.[0] || 'A'}
        </div>
      </div>
    </header>
  );
}
