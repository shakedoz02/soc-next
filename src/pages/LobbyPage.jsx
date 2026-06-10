import { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SCENARIOS } from '../data/scenarios';
import SeverityBadge from '../components/ui/SeverityBadge';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import XpProgressBar from '../components/ui/XpProgressBar';
import PrimaryButton from '../components/ui/PrimaryButton';

function rowToProfile(p) {
  return {
    id:                p.id,
    email:             p.email,
    name:              p.name,
    level:             p.level,
    xp:                p.xp,
    xpToNext:          p.xp_to_next,
    rank:              p.rank,
    sessionsCompleted: p.sessions_completed,
    accuracy:          Number(p.accuracy),
  };
}

export default function LobbyPage() {
  const { user: authUser } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser?.id) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      const [scenariosRes, profileRes] = await Promise.all([
        supabase.from('scenarios').select('*').eq('is_active', true),
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
      ]);

      const errors = [scenariosRes.error, profileRes.error].filter(Boolean);
      if (errors.length) {
        setError('שגיאה בטעינת הנתונים. מציג נתוני גיבוי.');
      }

      setScenarios(
        (!scenariosRes.error && scenariosRes.data?.length)
          ? scenariosRes.data
          : SCENARIOS
      );

      setProfile(
        (!profileRes.error && profileRes.data)
          ? rowToProfile(profileRes.data)
          : authUser
      );

      setLoading(false);
    }

    fetchData();
  }, [authUser?.id]);

  const user = profile || authUser;
  const xpPercent = Math.round(((user?.xp || 0) / (user?.xpToNext || 1)) * 100);

  const [displayPercent, setDisplayPercent] = useState(0);
  useEffect(() => {
    if (loading) return;
    const controls = animate(0, xpPercent, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: v => setDisplayPercent(Math.round(v)),
    });
    return controls.stop;
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[#9FEF00] text-4xl animate-spin">progress_activity</span>
          <span className="text-slate-400 text-sm">טוען נתונים...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        eyebrow="לובי ראשי"
        title={`שלום, ${user?.name} 👋`}
        description="בחר תרחיש תקיפה להתחלת סימולציה"
      />

      {error && (
        <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded">
          <span className="material-symbols-outlined text-base">warning</span>
          {error}
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'XP סה"כ', value: user?.xp?.toLocaleString(), icon: 'stars', color: 'text-[#9FEF00]' },
          { label: 'רמה', value: `Level ${user?.level}`, icon: 'emoji_events', color: 'text-yellow-400' },
          { label: 'דיוק ממוצע', value: `${user?.accuracy}%`, icon: 'verified', color: 'text-[#9FEF00]' },
          { label: 'משמרות הושלמו', value: user?.sessionsCompleted, icon: 'check_circle', color: 'text-[#9FEF00]' },
        ].map(({ label, value, icon, color }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, delay: index * 0.1 }}
          >
            <StatCard icon={icon} label={label} value={value} color={color} className="border border-[#222f45] p-5" />
          </motion.div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="bg-[#1C2536] border border-[#222f45] rounded-lg p-5 mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white">התקדמות לרמה {(user?.level || 0) + 1}</span>
          <span className="font-mono text-xs text-[#9FEF00]">{displayPercent}%</span>
        </div>
        <XpProgressBar xp={user?.xp} xpToNext={user?.xpToNext} percent={xpPercent} />
      </div>

      {/* Scenarios */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">תרחישי תקיפה</h2>
        <p className="text-slate-500 text-sm">בחר תרחיש להתחלת חקירה</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
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

            <h3 className="text-white font-bold text-lg mb-1">{scenario.titleHe || scenario.title_he}</h3>
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
                  <div className="text-xs font-mono text-[#9FEF00]">+{scenario.xpReward || scenario.xp_reward}</div>
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
