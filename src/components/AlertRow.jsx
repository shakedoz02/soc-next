const SEV_CONFIG = {
  CRITICAL: {
    text: 'text-red-400',
    icon: 'dangerous',
    iconColor: 'text-red-400',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/30',
  },
  HIGH: {
    text: 'text-orange-400',
    icon: 'warning',
    iconColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/30',
  },
  MEDIUM: {
    text: 'text-yellow-400',
    icon: 'warning',
    iconColor: 'text-yellow-400',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-slate-400',
    badgeBorder: 'border-slate-700',
  },
  LOW: {
    text: 'text-slate-400',
    icon: 'info',
    iconColor: 'text-slate-500',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-slate-500',
    badgeBorder: 'border-slate-800',
  },
};

export default function AlertRow({ severity, timestamp, source, title, cve, onInvestigate }) {
  const s = SEV_CONFIG[severity] || SEV_CONFIG.LOW;

  return (
    <tr className="hover:bg-[#1C2536]/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-lg ${s.iconColor}`}>{s.icon}</span>
          <span className={`font-bold text-sm ${s.text}`}>{severity}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-[10px] text-slate-500 font-technical-mono">{cve}</div>
      </td>
      <td className="px-6 py-4 text-left">
        <span className="font-technical-mono text-sm text-[#9FEF00]">{source}</span>
      </td>
      <td className="px-6 py-4 font-technical-mono text-xs text-slate-400">{timestamp}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 ${s.badgeBg} ${s.badgeText} border ${s.badgeBorder} rounded-sm text-[10px] font-bold uppercase`}>
          {severity}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={onInvestigate}
          className="bg-[#9FEF00] text-[#111927] px-4 py-1.5 rounded text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
        >
          חקור אירוע
        </button>
      </td>
    </tr>
  );
}
