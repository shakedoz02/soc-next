export default function StatCard({ icon, label, value, color = 'text-white', className = '', labelClassName = 'font-bold' }) {
  return (
    <div className={`bg-[#1C2536] rounded-lg ${className}`}>
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <span className={`material-symbols-outlined text-sm ${color}`} aria-hidden="true">{icon}</span>
        <span className={`text-[10px] uppercase tracking-wider ${labelClassName}`}>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
