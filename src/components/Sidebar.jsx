import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SidebarItem from './SidebarItem';

const NAV = [
  { to: '/lobby', icon: 'dashboard', label: 'לובי' },
  { to: '/alerts', icon: 'security', label: 'תור התראות' },
  { to: '/profile', icon: 'account_circle', label: 'פרופיל' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="bg-[#111927] border-l border-[#1C2536] fixed right-0 top-16 bottom-0 w-60 flex flex-col z-40">
      <div className="p-5 border-b border-[#1C2536]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#9FEF00] animate-pulse" />
          <span className="text-base font-bold text-[#9FEF00]">{user?.name}</span>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          Level {user?.level} · {user?.rank}
        </div>
        <div className="mt-3 w-full h-1 bg-[#1C2536] rounded-full">
          <div
            className="h-full bg-[#9FEF00] rounded-full"
            style={{ width: `${Math.round(((user?.xp || 0) / (user?.xpToNext || 1)) * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-600 font-mono">
          <span>{user?.xp?.toLocaleString()} XP</span>
          <span>{user?.xpToNext?.toLocaleString()} XP</span>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ to, icon, label }) => (
          <SidebarItem key={to} path={to} icon={icon} label={label} />
        ))}

        <div className="mt-6 px-5">
          <NavLink
            to="/alerts"
            className="w-full bg-[#9FEF00] text-[#111927] py-2.5 rounded font-bold uppercase tracking-tight text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            חקירה חדשה
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-[#1C2536] p-4 space-y-1">
        <a href="#" className="flex items-center gap-3 text-slate-600 px-2 py-1.5 hover:text-slate-300 text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">help_outline</span>
          תמיכה
        </a>
      </div>
    </aside>
  );
}
