import { memo } from 'react';
import { NavLink } from 'react-router-dom';

const BASE = 'flex items-center gap-3 px-5 py-3 w-full text-sm font-semibold transition-all duration-200';
const ACTIVE = 'bg-[#1C2536] text-[#9FEF00] border-r-4 border-[#9FEF00]';
const INACTIVE = 'text-slate-500 hover:bg-[#1C2536] hover:text-slate-200 border-r-4 border-transparent';

function SidebarItem({ icon, label, isActive, onClick, path }) {
  const inner = (
    <>
      <span className="material-symbols-outlined text-xl" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (path) {
    return (
      <NavLink
        to={path}
        onClick={onClick}
        aria-label={label}
        className={({ isActive }) => `${BASE} ${isActive ? ACTIVE : INACTIVE}`}
      >
        {inner}
      </NavLink>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`${BASE} ${isActive ? ACTIVE : INACTIVE}`}
    >
      {inner}
    </button>
  );
}

export default memo(SidebarItem);
