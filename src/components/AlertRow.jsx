import { memo } from 'react';
import { motion } from 'framer-motion';
import SeverityBadge from './ui/SeverityBadge';
import PrimaryButton from './ui/PrimaryButton';

const SEV_ICON = {
  CRITICAL: { icon: 'dangerous', iconColor: 'text-red-400', text: 'text-red-400' },
  HIGH:     { icon: 'warning',   iconColor: 'text-orange-400', text: 'text-orange-400' },
  MEDIUM:   { icon: 'warning',   iconColor: 'text-yellow-400', text: 'text-yellow-400' },
  LOW:      { icon: 'info',      iconColor: 'text-slate-500',  text: 'text-slate-400' },
};

function AlertRow({ severity, timestamp, source, title, cve, onInvestigate, index = 0 }) {
  const s = SEV_ICON[severity] || SEV_ICON.LOW;

  return (
    <motion.tr
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 180, delay: index * 0.04 }}
      whileHover={{
        backgroundColor: 'rgba(159, 239, 0, 0.07)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        transition: { duration: 0.18 },
      }}
      className="group cursor-default"
    >
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
    </motion.tr>
  );
}

export default memo(AlertRow);
