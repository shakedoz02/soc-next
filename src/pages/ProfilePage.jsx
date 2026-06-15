import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import XpProgressBar from '../components/ui/XpProgressBar';
import PrimaryButton from '../components/ui/PrimaryButton';

// Achievements are derived from real user + investigation data
function computeAchievements(user, investigations) {
  const scenarioIds = investigations.map(i => i.scenario_id);
  const uniqueScenarios = new Set(scenarioIds).size;
  const hasPerfect = investigations.some(i => i.score >= 100);
  const hasSpeed   = investigations.some(i => i.elapsed_seconds < 600); // under 10 min
  const hasSql     = scenarioIds.includes('sql-injection');

  return [
    {
      icon: 'military_tech',
      label: 'First Responder',
      desc: 'השלמת חקירה ראשונה',
      earned: (user?.sessionsCompleted || 0) >= 1,
    },
    {
      icon: 'speed',
      label: 'Speed Hunter',
      desc: 'חקירה תחת 10 דקות',
      earned: hasSpeed,
    },
    {
      icon: 'shield',
      label: 'SQL Slayer',
      desc: 'חסמת מתקפת SQL Injection',
      earned: hasSql,
    },
    {
      icon: 'psychology',
      label: 'Threat Analyst',
      desc: 'חקרת 5 תרחישים שונים',
      earned: uniqueScenarios >= 5,
    },
    {
      icon: 'verified_user',
      label: 'Perfect Score',
      desc: 'ניקוד 100 ללא שגיאות',
      earned: hasPerfect,
    },
    {
      icon: 'workspace_premium',
      label: 'Senior Analyst',
      desc: 'הגעת לרמה 10',
      earned: (user?.level || 0) >= 10,
    },
  ];
}

const SCENARIO_LABELS = {
  'sql-injection': 'SQL Injection',
  'brute-force':   'Brute Force',
  'ransomware':    'Ransomware',
  'port-scan':     'Port Scan',
};

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProfilePage() {
  const { user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [investigations, setInvestigations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Ensure profile stats are always fresh from the DB
  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchHistory() {
      try {
        const { data, error } = await supabase
          .from('investigations')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(20);
        if (!error && data) setInvestigations(data);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistory();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const xpPercent = Math.round(((user?.xp || 0) / (user?.xpToNext || 1)) * 100);
  const achievements = computeAchievements(user, investigations);
  const earnedCount  = achievements.filter(a => a.earned).length;

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        eyebrow="חשבון משתמש"
        title="פרופיל אישי"
        description="נהל את הפרופיל שלך ועקוב אחר ההתקדמות"
        className="mb-8"
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Profile card */}
        <motion.div
          className="col-span-12 md:col-span-4"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
        >
          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="w-20 h-20 rounded-full bg-[#9FEF00]/10 border-2 border-[#9FEF00]/40 flex items-center justify-center text-[#9FEF00] text-3xl font-black mb-4"
                aria-label={`אות ראשונה של שם: ${user?.name?.[0] || 'A'}`}
              >
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <h2 className="text-white font-bold text-xl">{user?.name}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: 0.15 }}
                className="mt-2 px-3 py-1 bg-[#9FEF00] rounded text-[#0d1117] text-xs font-black uppercase tracking-wider"
              >
                {user?.rank}
              </motion.div>
            </div>

            {/* XP bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500 font-mono uppercase">Level {user?.level}</span>
                <span className="text-[#9FEF00] font-mono">{xpPercent}%</span>
              </div>
              <XpProgressBar
                xp={user?.xp}
                xpToNext={user?.xpToNext}
                percent={xpPercent}
                labelClassName="mt-1 text-[10px] text-slate-600 font-mono"
              />
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: 'משמרות הושלמו', value: user?.sessionsCompleted ?? 0 },
                { label: 'דיוק ממוצע',    value: `${Number(user?.accuracy || 0).toFixed(1)}%` },
                { label: 'XP סה"כ',        value: (user?.xp || 0).toLocaleString() },
                { label: 'הישגים',          value: `${earnedCount} / ${achievements.length}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-[#222f45] pb-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-white font-mono font-bold">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSignOut}
              className="mt-6 w-full border border-red-500/30 text-red-400 py-2 rounded text-sm font-semibold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              aria-label="יציאה מהמערכת"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">logout</span>
              יציאה מהמערכת
            </button>
          </div>

          {/* Subscription */}
          <motion.div
            className="bg-[#1C2536] border border-[#9FEF00]/20 rounded-lg p-5 mt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0.18 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#9FEF00] text-base" aria-hidden="true">workspace_premium</span>
              <span className="text-sm font-bold text-white">תוכנית Free</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">שדרג לPro לגישה לכל התרחישים ודוחות מתקדמים</p>
            <PrimaryButton disabled className="w-full py-2 text-sm opacity-60 cursor-not-allowed">
              שדרג ל-Pro (בקרוב)
            </PrimaryButton>
          </motion.div>
        </motion.div>

        {/* Right column */}
        <motion.div
          className="col-span-12 md:col-span-8 space-y-6"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0.08 }}
        >
          {/* History */}
          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg">
            <div className="p-4 border-b border-[#222f45] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9FEF00] text-base" aria-hidden="true">history</span>
              <span className="text-sm font-bold text-slate-300">היסטוריית משמרות</span>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-slate-500 text-sm">טוען היסטוריה...</div>
            ) : investigations.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-slate-600 text-4xl block mb-2">history</span>
                <p className="text-slate-500 text-sm">עדיין אין חקירות. התחל את המשמרת הראשונה שלך!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1C2536]" role="list" aria-label="רשימת חקירות">
                {investigations.map((inv, index) => (
                  <motion.div
                    key={inv.id}
                    role="listitem"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.35, delay: index * 0.04 }}
                    className="px-5 py-4 flex items-center justify-between hover:bg-[#111927]/50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {inv.scenario_title || SCENARIO_LABELS[inv.scenario_id] || inv.scenario_id}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {formatDate(inv.completed_at)} · {formatDuration(inv.elapsed_seconds)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase">ניקוד</div>
                        <div className={`font-mono text-sm font-bold ${inv.score >= 80 ? 'text-[#9FEF00]' : inv.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {inv.score}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase">XP</div>
                        <div className="font-mono text-sm text-[#9FEF00]">+{inv.xp_earned}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase">שגיאות</div>
                        <div className={`font-mono text-sm ${inv.mistakes === 0 ? 'text-[#9FEF00]' : 'text-red-400'}`}>
                          {inv.mistakes}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-[#9FEF00]/10 border border-[#9FEF00]/30 text-[#9FEF00] text-[10px] font-bold rounded uppercase">
                        הושלם
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg">
            <div className="p-4 border-b border-[#222f45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9FEF00] text-base" aria-hidden="true">military_tech</span>
                <span className="text-sm font-bold text-slate-300">הישגים</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">{earnedCount}/{achievements.length} נרכשו</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3" role="list" aria-label="הישגים">
              {achievements.map(({ icon, label, desc, earned }, index) => (
                <motion.div
                  key={label}
                  role="listitem"
                  aria-label={`${label}: ${earned ? 'הושג' : 'לא הושג'}`}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: earned ? 1 : 0.4, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.15 + index * 0.06 }}
                  whileHover={earned ? { scale: 1.04, opacity: 1 } : {}}
                  className={`p-4 rounded border transition-colors ${
                    earned
                      ? 'bg-[#9FEF00]/5 border-[#9FEF00]/30'
                      : 'bg-[#111927]/50 border-[#222f45]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${earned ? 'text-[#9FEF00]' : 'text-slate-600'}`} aria-hidden="true">
                    {icon}
                  </span>
                  <div className="mt-2 text-xs font-bold text-white">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{desc}</div>
                  {earned && (
                    <div className="mt-2 text-[9px] text-[#9FEF00] font-mono uppercase tracking-wider">✔ הושג</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
