const SEVERITY_CONFIG = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  HIGH:     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  MEDIUM:   { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  LOW:      { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function SeverityBadge({ severity, className = '' }) {
  const s = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;
  return (
    <span
      className={`px-2 py-1 ${s.bg} ${s.text} border ${s.border} rounded-sm text-[10px] font-bold uppercase ${className}`}
    >
      {severity}
    </span>
  );
}
