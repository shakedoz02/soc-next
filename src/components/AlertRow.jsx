import { memo } from 'react';
import SeverityBadge from './ui/SeverityBadge';
import PrimaryButton from './ui/PrimaryButton';

const SEV_ICON = {
  CRITICAL: { icon: 'dangerous', iconColor: 'text-red-400', text: 'text-red-400' },
  HIGH:     { icon: 'warning',   iconColor: 'text-orange-400', text: 'text-orange-400' },
  MEDIUM:   { icon: 'warning',   iconColor: 'text-yellow-400', text: 'text-yellow-400' },
  LOW:      { icon: 'info',      iconColor: 'text-slate-500',  text: 'text-slate-400' },
};

function AlertRow({ severity, timestamp, source, title, cve, onInvestigate }) {
  const s = SEV_ICON[severity] || SEV_ICON.LOW;

  return (
    <tr className="hover:bg-[#1C2536]/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-lg ${s.iconColor}`} aria-hidden="true">{s.icon}</span>
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
        <SeverityBadge severity={severity} />
      </td>
      <td className="px-6 py-4 text-center">
        <PrimaryButton
          onClick={onInvestigate}
          aria-label={`חקור אירוע: ${title}`}
          className="px-4 py-1.5 text-xs"
        >
          חקור אירוע
        </PrimaryButton>
      </td>
    </tr>
  );
}

export default memo(AlertRow);
