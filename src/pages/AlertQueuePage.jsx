import { useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALERTS } from '../data/scenarios';
import AlertRow from '../components/AlertRow';

const FILTERS = ['הכל', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const FILTER_COLORS = {
  CRITICAL: 'text-red-400 border-red-500/40 hover:bg-red-500/10',
  HIGH: 'text-orange-400 border-orange-500/40 hover:bg-orange-500/10',
  MEDIUM: 'text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/10',
  LOW: 'text-slate-400 border-slate-500/40 hover:bg-slate-500/10',
  הכל: 'text-[#9FEF00] border-[#9FEF00]/40 hover:bg-[#9FEF00]/10',
};

function FilterButton({ label, active, count, onClick }) {
  const colors = FILTER_COLORS[label] || FILTER_COLORS['הכל'];
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-[10px] uppercase font-bold tracking-tighter transition-all px-2 py-0.5 rounded border ${
        active
          ? `${colors} border-opacity-100`
          : 'text-slate-500 border-transparent hover:text-slate-300'
      }`}
    >
      {label}
      {count != null && (
        <span className="mr-1 opacity-60">({count})</span>
      )}
    </button>
  );
}

const MemoFilterButton = memo(FilterButton);

export default function AlertQueuePage() {
  const [filter, setFilter] = useState('הכל');
  const navigate = useNavigate();

  const filtered = useMemo(
    () => filter === 'הכל' ? ALERTS : ALERTS.filter(a => a.severity === filter),
    [filter]
  );

  const counts = useMemo(() => {
    const c = { הכל: ALERTS.length };
    ALERTS.forEach(a => { c[a.severity] = (c[a.severity] || 0) + 1; });
    return c;
  }, []);

  const criticalCount = counts.CRITICAL || 0;

  return (
    <div className="p-8 font-assistant">
      {/* Page header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">תור התראות פעיל</h1>
          <p className="text-slate-400">מעקב וניהול אירועי אבטחה בזמן אמת</p>
        </div>
        <div className="flex gap-3 items-center">
          <span
            role="status"
            aria-label={`${criticalCount} התראות קריטיות`}
            className="bg-[#1C2536] border border-red-500/30 text-red-400 px-3 py-1.5 rounded-sm text-xs font-bold font-technical-mono"
          >
            {criticalCount} CRITICAL
          </span>
          <span className="bg-[#1C2536] border border-[#1C2536] text-slate-400 px-3 py-1.5 rounded-sm text-xs font-bold font-technical-mono">
            {ALERTS.length} ACTIVE
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1C2536] border border-[#1C2536] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" aria-hidden="true" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Alerts</span>
            <span className="material-symbols-outlined text-red-400" aria-hidden="true">dangerous</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{criticalCount}</div>
          <div className="w-full bg-[#111927] h-1 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (criticalCount / ALERTS.length) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-[#1C2536] border border-[#1C2536] p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mean Time to Resolve</span>
            <span className="material-symbols-outlined text-[#9FEF00]" aria-hidden="true">timer</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">42m</div>
          <div className="text-xs text-[#9FEF00] flex items-center gap-1">
            <span className="material-symbols-outlined text-xs" aria-hidden="true">trending_down</span>
            12% שיפור מהשבוע שעבר
          </div>
        </div>

        <div className="bg-[#1C2536] border border-[#1C2536] p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">System Health</span>
            <span className="material-symbols-outlined text-[#9FEF00]" aria-hidden="true">bolt</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">99.8%</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Global Infrastructure</div>
        </div>
      </div>

      {/* Alert table */}
      <div className="bg-[#1C2536] border border-[#1C2536] rounded-sm">
        <div className="p-4 border-b border-[#1C2536] flex justify-between items-center bg-[#1C2536]/30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-300">רשימת התראות</span>
            <div className="w-px h-4 bg-slate-700" aria-hidden="true" />
            <div className="flex gap-2" role="group" aria-label="סינון לפי חומרה">
              {FILTERS.map(f => (
                <MemoFilterButton
                  key={f}
                  label={f}
                  active={filter === f}
                  count={f !== 'הכל' ? counts[f] : null}
                  onClick={() => setFilter(f)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="רענן רשימת התראות"
              className="material-symbols-outlined text-slate-500 text-sm hover:text-slate-200 transition-colors"
            >
              refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse font-assistant" aria-label="תור התראות">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 bg-[#1C2536]/20">
                <th scope="col" className="px-6 py-4 font-semibold">חומרה</th>
                <th scope="col" className="px-6 py-4 font-semibold">שם התראה</th>
                <th scope="col" className="px-6 py-4 font-semibold text-left">מקור</th>
                <th scope="col" className="px-6 py-4 font-semibold">זמן אירוע</th>
                <th scope="col" className="px-6 py-4 font-semibold">סטטוס</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2536]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    אין התראות ברמת חומרה זו
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    severity={alert.severity}
                    timestamp={alert.timestamp}
                    source={alert.source}
                    title={alert.title}
                    cve={alert.cve}
                    onInvestigate={() => navigate(`/investigate/${alert.scenarioId}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#1C2536] flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-assistant">
          <div aria-live="polite">
            מציג {filtered.length} מתוך {ALERTS.length} התראות
          </div>
        </div>
      </div>
    </div>
  );
}
