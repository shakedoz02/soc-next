import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PrimaryButton from '../components/ui/PrimaryButton';

const TERMINAL_LINES = [
  '> initializing neural-threat-engine...',
  '> loading practice_scenarios_hebrew.db [DONE]',
  '> checking analyst credentials... AUTHORIZED',
  '> system ready. awaiting command_',
];

const STATS = [
  { value: '1,200+', label: 'Active Analysts' },
  { value: '50k+', label: 'Logs Analyzed' },
  { value: '150+', label: 'Scenarios' },
  { value: '98%', label: 'Success Rate' },
];

function TerminalPreview() {
  return (
    <div className="w-full h-full bg-[#0D1117] rounded-lg border border-[#1C2536] p-4 font-technical-mono text-xs" dir="ltr">
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1C2536]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#9FEF00]/60" />
      </div>
      <div className="space-y-1.5 text-[#9FEF00] opacity-80">
        <p className="text-slate-500">Last login: Mon May 20 14:05 on soc-station</p>
        <p>&gt; fw-block 192.168.1.105</p>
        <p className="text-green-400">✔ IP blocked successfully</p>
        <p>&gt; grep "UNION SELECT" /var/log/nginx/access.log</p>
        <p className="text-red-400">45.22.11.90 POST /login 500 "admin&apos; UNION SELECT..."</p>
        <p className="flex items-center gap-1">
          <span>&gt;&nbsp;</span>
          <span className="inline-block w-2 h-3.5 bg-[#9FEF00] animate-pulse" />
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const ctaTo = user ? '/lobby' : '/auth';

  // If already authenticated (e.g. after clicking the confirmation email link),
  // redirect straight to the lobby without showing the landing page.
  useEffect(() => {
    if (!loading && user) navigate('/lobby', { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#111927] font-assistant overflow-x-hidden">

      {/* TopAppBar */}
      <header className="bg-[#111927] border-b border-[#1C2536] fixed top-0 w-full h-16 z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-tighter text-[#9FEF00] uppercase neon-glow">SOC-Next</span>
          <nav className="hidden md:flex gap-6">
            <span className="text-[#9FEF00] border-b-2 border-[#9FEF00] pb-1 font-semibold text-sm cursor-default">
              Training
            </span>
            <Link to="/alerts" className="text-slate-400 hover:text-[#9FEF00] transition-colors font-semibold text-sm">
              Alerts
            </Link>
            <Link to="/alerts" className="text-slate-400 hover:text-[#9FEF00] transition-colors font-semibold text-sm">
              Simulations
            </Link>
            <a href="#features" className="text-slate-400 hover:text-[#9FEF00] transition-colors font-semibold text-sm">
              Academy
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 hover:text-[#9FEF00] transition-colors cursor-pointer">terminal</span>
            <span className="material-symbols-outlined text-slate-400 hover:text-[#9FEF00] transition-colors cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-slate-400 hover:text-[#9FEF00] transition-colors cursor-pointer">settings</span>
          </div>
          <PrimaryButton to={ctaTo} className="px-4 py-1.5 text-sm uppercase duration-100">
            Deploy Shell
          </PrimaryButton>
        </div>
      </header>

      <main className="pt-16">

        {/* Hero Section */}
        <section className="relative flex items-start justify-center pt-20 md:pt-24 pb-48 overflow-hidden border-b border-[#1C2536]">
          {/* Dot grid background */}
          <div className="absolute inset-0 z-0 opacity-20 dot-grid" />

          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* Version badge */}
            <div className="inline-block border border-[#9FEF00]/30 bg-[#9FEF00]/5 px-4 py-1 rounded-full mb-6">
              <span className="font-technical-mono text-[10px] text-[#9FEF00] tracking-[0.2em] uppercase">
                MISSION CRITICAL SYSTEM v4.0
              </span>
            </div>

            <h1 className="text-[64px] md:text-[84px] leading-tight mb-4 tracking-tighter font-extrabold">
              SOC-<span className="text-[#9FEF00] neon-glow">Next</span>
            </h1>

            <p className="text-slate-400 text-2xl font-semibold mb-10 max-w-2xl mx-auto">
              תחנת התרגול המושלמת לאנליסטים מתחילים.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <PrimaryButton to={ctaTo} className="px-8 py-4 text-lg shadow-[0_0_20px_rgba(159,239,0,0.3)]">
                התחל תרגול עכשיו
              </PrimaryButton>
              <a
                href="#features"
                className="border-2 border-[#9FEF00] text-[#9FEF00] px-8 py-4 font-bold text-lg rounded hover:bg-[#9FEF00]/10 active:scale-95 transition-all"
              >
                צפה בדמו
              </a>
            </div>
          </div>

          {/* Decorative Terminal — overlaps into next section */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-[#0D1117] border-x border-t border-[#1C2536] rounded-t-xl p-4 hidden md:block">
            <div className="flex items-center gap-2 mb-4 border-b border-[#1C2536] pb-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="font-technical-mono text-[10px] text-slate-500 mr-4 uppercase tracking-widest" dir="ltr">
                root@soc-next: ~/kernel/simulation
              </span>
            </div>
            <div className="font-technical-mono text-sm text-[#9FEF00] opacity-80 leading-relaxed space-y-1" dir="ltr">
              {TERMINAL_LINES.map((line, i) => (
                <p key={i} className={i === TERMINAL_LINES.length - 1 ? 'terminal-cursor' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-[#111927]">
          <div className="container mx-auto px-6">
            {/* Section header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">יכולות המערכת</h2>
                <p className="text-slate-500">כלים מתקדמים להכשרה מקצועית בעולם הסייבר</p>
              </div>
              <div className="h-0.5 flex-grow bg-gradient-to-l from-[#9FEF00]/50 to-transparent mx-8 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Hebrew Practice — col-span-4 */}
              <div className="md:col-span-4 bg-[#1C2536] border border-[#1C2536] p-8 rounded transition-all hover:border-[#9FEF00]/50 group">
                <div className="w-12 h-12 bg-[#9FEF00]/10 rounded flex items-center justify-center mb-6 group-hover:bg-[#9FEF00]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#9FEF00] text-3xl">translate</span>
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">Hebrew practice</h3>
                <p className="text-slate-400 leading-relaxed">
                  תרגול מלא בשפה העברית, מותאם לשוק המקומי ולצרכי האנליסט הישראלי, כולל תרחישי אמת.
                </p>
              </div>

              {/* Terminal Simulator — col-span-8, featured */}
              <div className="md:col-span-8 bg-[#1C2536] border border-[#1C2536] rounded overflow-hidden transition-all hover:border-[#9FEF00]/50 group">
                <div className="p-8 flex flex-col md:flex-row h-full gap-8">
                  <div className="flex-1 flex flex-col">
                    <div className="w-12 h-12 bg-[#9FEF00]/10 rounded flex items-center justify-center mb-6 group-hover:bg-[#9FEF00]/20 transition-colors">
                      <span className="material-symbols-outlined text-[#9FEF00] text-3xl">terminal</span>
                    </div>
                    <h3 className="text-white font-semibold text-xl mb-3">Terminal simulator</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      סימולטור טרמינל מלא המאפשר הרצת פקודות, ניתוח לוגים וביצוע חקירות פורנזיות בסביבה סטרילית ובטוחה.
                    </p>
                    <Link
                      to={ctaTo}
                      className="text-[#9FEF00] font-bold flex items-center gap-2 hover:gap-4 transition-all mt-auto w-fit"
                    >
                      גלה עוד
                      <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </Link>
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <TerminalPreview />
                  </div>
                </div>
              </div>

              {/* Professional Reports — col-span-7 */}
              <div className="md:col-span-7 bg-[#1C2536] border border-[#1C2536] rounded p-8 transition-all hover:border-[#9FEF00]/50 group flex items-center gap-8">
                <div className="flex-1">
                  <div className="w-12 h-12 bg-[#9FEF00]/10 rounded flex items-center justify-center mb-6 group-hover:bg-[#9FEF00]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#9FEF00] text-3xl">assessment</span>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-3">Professional reports</h3>
                  <p className="text-slate-400 leading-relaxed">
                    הפקת דוחות מקצועיים בסיום כל תרגול, הכוללים מדדי ביצוע, נקודות לשיפור והמלצות להמשך למידה.
                  </p>
                </div>
                {/* Spinning score ring */}
                <div className="hidden lg:flex items-center justify-center w-48 h-48 bg-[#111927] rounded-full border-4 border-[#9FEF00]/20 relative flex-shrink-0">
                  <div
                    className="absolute inset-4 rounded-full border-2 border-[#9FEF00] border-t-transparent animate-spin"
                    style={{ animationDuration: '3000ms' }}
                  />
                  <span className="font-technical-mono text-[#9FEF00] text-2xl relative z-10">84%</span>
                </div>
              </div>

              {/* CTA Card — col-span-5 */}
              <div className="md:col-span-5 bg-gradient-to-br from-[#9FEF00]/20 to-transparent border border-[#9FEF00]/30 rounded p-8 flex flex-col justify-center text-center">
                <h4 className="text-white font-semibold text-xl mb-2">מוכן להתחיל?</h4>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  הצטרף למאות אנליסטים שכבר מתרגלים ב-SOC-Next
                </p>
                <PrimaryButton to={ctaTo} className="px-6 py-2 self-center">
                  הרשמה מהירה
                </PrimaryButton>
              </div>

            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-[#1C2536] bg-[#0D1117]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="font-technical-mono text-4xl text-[#9FEF00] mb-2 neon-glow">{value}</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#111927] border-t border-[#1C2536] py-8">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-lg font-bold text-[#9FEF00] uppercase">SOC-Next</span>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest">
              © 2024 SOC-Next Technical Operations. Restricted Access.
            </p>
          </div>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Engagement', 'SLA', 'Documentation'].map(t => (
              <a key={t} href="#" className="text-slate-600 hover:text-slate-300 text-[10px] uppercase tracking-widest transition-colors">
                {t}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
