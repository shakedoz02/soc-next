import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ACHIEVEMENTS = [
  { icon: 'military_tech', label: 'First Responder', desc: 'השלמת חקירה ראשונה', earned: true },
  { icon: 'speed', label: 'Speed Hunter', desc: 'חקירה תחת 10 דקות', earned: true },
  { icon: 'shield', label: 'SQL Slayer', desc: 'חסמת מתקפת SQL Injection', earned: true },
  { icon: 'psychology', label: 'Threat Analyst', desc: 'חקרת 5 תרחישים שונים', earned: false },
  { icon: 'verified_user', label: 'Perfect Score', desc: 'ניקוד 100 ללא שגיאות', earned: false },
  { icon: 'workspace_premium', label: 'Senior Analyst', desc: 'הגעת לרמה 10', earned: false },
];

const HISTORY = [
  { id: 'SQL Injection', score: 92, xp: '+460', date: '24/05/2024', status: 'success' },
  { id: 'Brute Force', score: 78, xp: '+273', date: '22/05/2024', status: 'success' },
  { id: 'Port Scan', score: 85, xp: '+170', date: '20/05/2024', status: 'success' },
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const xpPercent = Math.round(((user?.xp || 0) / (user?.xpToNext || 1)) * 100);

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">חשבון משתמש</div>
        <h1 className="text-3xl font-bold text-white mb-1">פרופיל ואנליטיקס</h1>
        <p className="text-slate-400">נהל את הפרופיל שלך ועקוב אחר ההתקדמות</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#9FEF00]/10 border-2 border-[#9FEF00]/40 flex items-center justify-center text-[#9FEF00] text-3xl font-black mb-4">
                {user?.name?.[0] || 'A'}
              </div>
              <h2 className="text-white font-bold text-xl">{user?.name}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
              <div className="mt-2 px-3 py-1 bg-[#9FEF00]/10 border border-[#9FEF00]/30 rounded text-[#9FEF00] text-xs font-bold uppercase tracking-wider">
                {user?.rank}
              </div>
            </div>

            {/* XP */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500 font-mono uppercase">Level {user?.level}</span>
                <span className="text-[#9FEF00] font-mono">{xpPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#111927] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9FEF00] rounded-full transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-600 font-mono">
                <span>{user?.xp?.toLocaleString()} XP</span>
                <span>{user?.xpToNext?.toLocaleString()} XP</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: 'משמרות הושלמו', value: user?.sessionsCompleted },
                { label: 'דיוק ממוצע', value: `${user?.accuracy}%` },
                { label: 'XP סה"כ', value: user?.xp?.toLocaleString() },
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
            >
              <span className="material-symbols-outlined text-base">logout</span>
              יציאה מהמערכת
            </button>
          </div>

          {/* Subscription */}
          <div className="bg-[#1C2536] border border-[#9FEF00]/20 rounded-lg p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#9FEF00] text-base">workspace_premium</span>
              <span className="text-sm font-bold text-white">תוכנית Free</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">שדרג לPro לגישה לכל התרחישים ודוחות מתקדמים</p>
            <button className="w-full bg-[#9FEF00] text-[#111927] py-2 rounded text-sm font-bold hover:brightness-110 active:scale-95 transition-all">
              שדרג ל-Pro (בקרוב)
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* History */}
          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg">
            <div className="p-4 border-b border-[#222f45] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9FEF00] text-base">history</span>
              <span className="text-sm font-bold text-slate-300">היסטוריית משמרות</span>
            </div>
            <div className="divide-y divide-[#1C2536]">
              {HISTORY.map((h) => (
                <div key={h.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#111927]/50 transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-white">{h.id}</div>
                    <div className="text-xs text-slate-500 font-mono">{h.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase">ניקוד</div>
                      <div className="font-mono text-sm text-[#9FEF00]">{h.score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase">XP</div>
                      <div className="font-mono text-sm text-[#9FEF00]">{h.xp}</div>
                    </div>
                    <span className="px-2 py-1 bg-[#9FEF00]/10 border border-[#9FEF00]/30 text-[#9FEF00] text-[10px] font-bold rounded uppercase">
                      הושלם
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg">
            <div className="p-4 border-b border-[#222f45] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9FEF00] text-base">military_tech</span>
              <span className="text-sm font-bold text-slate-300">הישגים</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map(({ icon, label, desc, earned }) => (
                <div
                  key={label}
                  className={`p-4 rounded border transition-all ${
                    earned
                      ? 'bg-[#9FEF00]/5 border-[#9FEF00]/30'
                      : 'bg-[#111927]/50 border-[#222f45] opacity-40'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${earned ? 'text-[#9FEF00]' : 'text-slate-600'}`}>
                    {icon}
                  </span>
                  <div className="mt-2 text-xs font-bold text-white">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
