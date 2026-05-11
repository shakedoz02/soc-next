import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SCENARIOS } from '../data/scenarios';

const DIFF_COLORS = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  LOW: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function LobbyPage() {
  const { user } = useAuth();
  const xpPercent = Math.round(((user?.xp || 0) / (user?.xpToNext || 1)) * 100);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">לובי ראשי</div>
        <h1 className="text-3xl font-bold text-white mb-1">שלום, {user?.name} 👋</h1>
        <p className="text-slate-400">בחר תרחיש תקיפה להתחלת סימולציה</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'XP סה"כ', value: user?.xp?.toLocaleString(), icon: 'stars', color: 'text-[#9FEF00]' },
          { label: 'רמה', value: `Level ${user?.level}`, icon: 'emoji_events', color: 'text-yellow-400' },
          { label: 'דיוק ממוצע', value: `${user?.accuracy}%`, icon: 'verified', color: 'text-[#9FEF00]' },
          { label: 'משמרות הושלמו', value: user?.sessionsCompleted, icon: 'check_circle', color: 'text-[#9FEF00]' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-[#1C2536] border border-[#222f45] rounded-lg p-5">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="bg-[#1C2536] border border-[#222f45] rounded-lg p-5 mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white">התקדמות לרמה {(user?.level || 0) + 1}</span>
          <span className="font-mono text-xs text-[#9FEF00]">{xpPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#111927] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#9FEF00] rounded-full transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
          <span>{user?.xp?.toLocaleString()} XP</span>
          <span>{user?.xpToNext?.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Scenarios */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">תרחישי תקיפה</h2>
        <p className="text-slate-500 text-sm">בחר תרחיש להתחלת חקירה</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCENARIOS.map((scenario) => {
          const diff = DIFF_COLORS[scenario.difficulty] || DIFF_COLORS.LOW;
          return (
            <div
              key={scenario.id}
              className="bg-[#1C2536] border border-[#222f45] rounded-lg p-6 hover:border-[#9FEF00]/40 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 bg-[#9FEF00]/10 rounded flex items-center justify-center group-hover:bg-[#9FEF00]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#9FEF00] text-2xl">{scenario.icon}</span>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${diff.bg} ${diff.text} border ${diff.border}`}>
                  {scenario.difficulty}
                </span>
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{scenario.titleHe}</h3>
              <p className="text-xs text-slate-500 font-mono mb-1">{scenario.title}</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">{scenario.description}</p>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 uppercase">משך</div>
                    <div className="text-xs font-mono text-slate-300">{scenario.duration}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 uppercase">XP</div>
                    <div className="text-xs font-mono text-[#9FEF00]">+{scenario.xpReward}</div>
                  </div>
                </div>
                <Link
                  to={`/investigate/${scenario.id}`}
                  className="bg-[#9FEF00] text-[#111927] px-5 py-2 rounded text-sm font-bold hover:brightness-110 active:scale-95 transition-all"
                >
                  התחל חקירה
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
