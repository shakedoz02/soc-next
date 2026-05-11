import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALERTS } from '../data/scenarios';
import AlertRow from '../components/AlertRow';

const FILTERS = ['הכל', 'CRITICAL', 'HIGH', 'LOW'];

export default function AlertQueuePage() {
  const [filter, setFilter] = useState('הכל');
  const navigate = useNavigate();

  const filtered = filter === 'הכל' ? ALERTS : ALERTS.filter(a => a.severity === filter);
  const criticalCount = ALERTS.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="p-8 font-assistant">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">תור התראות פעיל</h1>
          <p className="text-slate-400">מעקב וניהול אירועי אבטחה בזמן אמת עבור סביבת המבצעים</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="bg-[#1C2536] border border-red-500/30 text-red-400 px-3 py-1.5 rounded-sm text-xs font-bold font-technical-mono">
            {criticalCount} CRITICAL
          </span>
          <span className="bg-[#1C2536] border border-[#1C2536] text-slate-400 px-3 py-1.5 rounded-sm text-xs font-bold font-technical-mono">
            {ALERTS.length} ACTIVE
          </span>
          <button className="border border-[#9FEF00] text-[#9FEF00] px-4 py-1.5 rounded text-sm hover:bg-[#9FEF00]/10 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            מסננים
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1C2536] border border-[#1C2536] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Alerts</span>
            <span className="material-symbols-outlined text-red-400">dangerous</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{criticalCount}</div>
          <div className="w-full bg-[#111927] h-1 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-[65%]" />
          </div>
        </div>

        <div className="bg-[#1C2536] border border-[#1C2536] p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mean Time to Resolve</span>
            <span className="material-symbols-outlined text-[#9FEF00]">timer</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">42m</div>
          <div className="text-xs text-[#9FEF00] flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_down</span>
            12% שיפור מהשבוע שעבר
          </div>
        </div>

        <div className="bg-[#1C2536] border border-[#1C2536] p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">System Health</span>
            <span className="material-symbols-outlined text-[#9FEF00]">bolt</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">99.8%</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Global Infrastructure</div>
        </div>
      </div>

      {/* Alert Table */}
      <div className="bg-[#1C2536] border border-[#1C2536] rounded-sm">
        <div className="p-4 border-b border-[#1C2536] flex justify-between items-center bg-[#1C2536]/30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-300">רשימת התראות</span>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex gap-3">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[10px] uppercase font-bold tracking-tighter transition-colors px-1 ${
                    filter === f
                      ? 'text-[#9FEF00] border-b border-[#9FEF00]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="material-symbols-outlined text-slate-500 text-sm hover:text-slate-200">download</button>
            <button className="material-symbols-outlined text-slate-500 text-sm hover:text-slate-200">refresh</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse font-assistant">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 bg-[#1C2536]/20">
                <th className="px-6 py-4 font-semibold">חומרה</th>
                <th className="px-6 py-4 font-semibold">שם התראה</th>
                <th className="px-6 py-4 font-semibold text-left">מקור (Source)</th>
                <th className="px-6 py-4 font-semibold">זמן אירוע</th>
                <th className="px-6 py-4 font-semibold">סטטוס</th>
                <th className="px-6 py-4 font-semibold text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2536]">
              {filtered.map((alert) => (
                <AlertRow
                  key={alert.id}
                  severity={alert.severity}
                  timestamp={alert.timestamp}
                  source={alert.source}
                  title={alert.title}
                  cve={alert.cve}
                  onInvestigate={() => navigate(`/investigate/${alert.scenarioId}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#1C2536] flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-assistant">
          <div>Showing 1 – {filtered.length} of {ALERTS.length} Alerts</div>
          <div className="flex gap-4">
            <button className="hover:text-[#9FEF00] transition-colors">Previous</button>
            <div className="flex gap-2">
              <span className="text-[#9FEF00]">01</span>
              <span>02</span>
              <span>03</span>
            </div>
            <button className="hover:text-[#9FEF00] transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
