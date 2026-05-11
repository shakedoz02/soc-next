import { NavLink } from 'react-router-dom';

const BASE = 'flex items-center gap-3 px-5 py-3 w-full text-sm font-semibold transition-all duration-200';
const ACTIVE = 'bg-[#1C2536] text-[#9FEF00] border-r-4 border-[#9FEF00]';
const INACTIVE = 'text-slate-500 hover:bg-[#1C2536] hover:text-slate-200 border-r-4 border-transparent';

export default function SidebarItem({ icon, label, isActive, onClick, path }) {
  const inner = (
    <>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (path) {
    return (
      <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive }) => `${BASE} ${isActive ? ACTIVE : INACTIVE}`}
      >
        {inner}
      </NavLink>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${BASE} ${isActive ? ACTIVE : INACTIVE}`}
    >
      {inner}
    </button>
  );
}
