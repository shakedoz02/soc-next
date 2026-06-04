import { useAuth } from '../contexts/AuthContext';
import { SCENARIOS } from '../data/scenarios';
import SeverityBadge from '../components/ui/SeverityBadge';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import XpProgressBar from '../components/ui/XpProgressBar';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function LobbyPage() {
  const { user } = useAuth();
  const xpPercent = Math.round(((user?.xp || 0) / (user?.xpToNext || 1)) * 100);

  return (
    <div className="p-8">
      <PageHeader
        eyebrow="לובי ראשי"
        title={`שלום, ${user?.name} 👋`}
        description="בחר תרחיש תקיפה להתחלת סימולציה"
      />

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'XP סה"כ', value: user?.xp?.toLocaleString(), icon: 'stars', color: 'text-[#9FEF00]' },
          { label: 'רמה', value: `Level ${user?.level}`, icon: 'emoji_events', color: 'text-yellow-400' },
          { label: 'דיוק ממוצע', value: `${user?.accuracy}%`, icon: 'verified', color: 'text-[#9FEF00]' },
          { label: 'משמרות הושלמו', value: user?.sessionsCompleted, icon: 'check_circle', color: 'text-[#9FEF00]' },
        ].map(({ label, value, icon, color }) => (
          <StatCard key={label} icon={icon} label={label} value={value} color={color} className="border border-[#222f45] p-5" />
        ))}
      </div>

      {/* XP Progress */}
      <div className="bg-[#1C2536] border border-[#222f45] rounded-lg p-5 mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white">התקדמות לרמה {(user?.level || 0) + 1}</span>
          <span className="font-mono text-xs text-[#9FEF00]">{xpPercent}%</span>
        </div>
        <XpProgressBar xp={user?.xp} xpToNext={user?.xpToNext} percent={xpPercent} />
      </div>

      {/* Scenarios */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">תרחישי תקיפה</h2>
        <p className="text-slate-500 text-sm">בחר תרחיש להתחלת חקירה</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            className="bg-[#1C2536] border border-[#222f45] rounded-lg p-6 hover:border-[#9FEF00]/40 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 bg-[#9FEF00]/10 rounded flex items-center justify-center group-hover:bg-[#9FEF00]/20 transition-colors">
                <span className="material-symbols-outlined text-[#9FEF00] text-2xl">{scenario.icon}</span>
              </div>
              <SeverityBadge severity={scenario.difficulty} />
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
              <PrimaryButton to={`/investigate/${scenario.id}`} className="px-5 py-2 text-sm">
                התחל חקירה
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
