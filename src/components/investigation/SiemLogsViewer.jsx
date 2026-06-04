import { memo } from 'react';

const LOG_LEVEL_COLORS = {
  CRITICAL: 'text-red-400',
  ERROR: 'text-orange-400',
  WARN: 'text-yellow-400',
  INFO: 'text-slate-400',
};

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function LogRow({ log, isActive, onClick }) {
  const isCritical = log.level === 'CRITICAL' || log.level === 'ERROR';
  return (
    <tr
      onClick={onClick}
      role="row"
      aria-selected={isActive}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={`border-b border-slate-800/50 cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-[#9FEF00]/50 ${
        isActive
          ? 'bg-[#9FEF00]/5 border-[#9FEF00]/20'
          : isCritical
          ? 'hover:bg-red-500/5'
          : 'hover:bg-[#1C2536]'
      }`}
    >
      <td className="px-4 py-2 text-slate-500 whitespace-nowrap text-xs">
        {formatTimestamp(log.timestamp)}
      </td>
      <td className={`px-4 py-2 whitespace-nowrap text-xs font-bold ${isCritical ? 'text-red-400' : 'text-[#9FEF00]'}`}>
        {log.source}
      </td>
      <td className="px-4 py-2">
        <span className={`text-[10px] font-bold ${LOG_LEVEL_COLORS[log.level] || 'text-slate-400'}`}
          aria-label={`רמה: ${log.level}`}>
          [{log.level}]
        </span>
      </td>
      <td className={`px-4 py-2 text-xs leading-relaxed ${isCritical ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
        {log.message}
      </td>
    </tr>
  );
}

const MemoLogRow = memo(LogRow);

export default function SiemLogsViewer({ scenario, activeLog, onLogSelect }) {
  return (
    <section
      className="flex-1 bg-[#1C2536] border-b border-[#1C2536] flex flex-col overflow-hidden"
      aria-label="צופה לוגי SIEM"
    >
      <div className="px-4 py-2 bg-[#111927] border-b border-[#1C2536] flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400 text-sm" aria-hidden="true">database</span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-technical-mono">
            SIEM Logs Viewer — {scenario.title}
          </span>
        </div>
        <div className="flex gap-2" aria-hidden="true">
          <div className="w-2 h-2 rounded-full bg-[#9FEF00]" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[#0D1117]">
        <table className="w-full text-left border-collapse font-technical-mono text-sm" role="grid" aria-label="לוגי אירוע">
          <thead className="sticky top-0 bg-[#0D1117] z-10">
            <tr className="text-slate-500 border-b border-slate-800">
              <th scope="col" className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider whitespace-nowrap">Timestamp</th>
              <th scope="col" className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider whitespace-nowrap">Source</th>
              <th scope="col" className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Level</th>
              <th scope="col" className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {scenario.logs.map((log) => (
              <MemoLogRow
                key={log.id}
                log={log}
                isActive={activeLog?.id === log.id}
                onClick={() => onLogSelect(activeLog?.id === log.id ? null : log)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
