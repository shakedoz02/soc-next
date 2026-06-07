import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [tab, setTab]                   = useState('login');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [name, setName]                 = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = tab === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, name);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate('/lobby', { replace: true });
  };

  const switchTab = (t) => {
    setTab(t);
    setEmail('');
    setPassword('');
    setName('');
  };

  // ── Login / Register form ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111927] flex flex-col">
      <header className="h-16 border-b border-[#1C2536] flex items-center px-6">
        <Link to="/" className="text-xl font-black tracking-tighter text-[#9FEF00] uppercase neon-glow">
          SOC-Next
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block border border-[#9FEF00]/30 bg-[#9FEF00]/5 px-4 py-1 rounded-full mb-4">
              <span className="font-mono text-[10px] text-[#9FEF00] tracking-[0.2em] uppercase">SECURE ACCESS PORTAL</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              {tab === 'login' ? 'כניסה למערכת' : 'הרשמה למערכת'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {tab === 'login' ? 'הזן את פרטי הכניסה שלך' : 'צור חשבון אנליסט חדש'}
            </p>
          </div>

          <div className="bg-[#1C2536] border border-[#222f45] rounded-lg p-8">
            <div className="flex gap-1 mb-8 bg-[#111927] rounded p-1" role="tablist" aria-label="מצב כניסה">
              {[
                { key: 'login',    label: 'כניסה'  },
                { key: 'register', label: 'הרשמה' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => switchTab(key)}
                  className={`flex-1 py-2 rounded text-sm font-semibold transition-all ${
                    tab === key
                      ? 'bg-[#9FEF00] text-[#111927]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {tab === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    שם מלא
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="אנליסט ראשי"
                    required
                    className="w-full bg-[#111927] border-b-2 border-[#222f45] focus:border-[#9FEF00] outline-none text-white px-3 py-3 text-sm transition-colors placeholder-slate-600"
                    dir="rtl"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  אימייל
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="analyst@soc.il"
                  required
                  autoComplete="email"
                  className="w-full bg-[#111927] border-b-2 border-[#222f45] focus:border-[#9FEF00] outline-none text-white px-3 py-3 text-sm transition-colors placeholder-slate-600"
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  סיסמה
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="מינימום 6 תווים"
                  required
                  minLength={6}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-[#111927] border-b-2 border-[#222f45] focus:border-[#9FEF00] outline-none text-white px-3 py-3 text-sm transition-colors placeholder-slate-600"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-[#9FEF00] text-[#111927] py-3 rounded font-bold text-sm uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 cyber-glow"
              >
                {loading
                  ? <span className="font-mono text-xs">מאמת...</span>
                  : tab === 'login' ? 'כניסה למערכת' : 'יצירת חשבון'}
              </button>
            </form>

            {tab === 'login' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-[#9FEF00] transition-colors"
                  onClick={() => toast.info('שחזור סיסמה — בקרוב!')}
                >
                  שכחת סיסמה?
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            {tab === 'login' ? 'אין לך חשבון? ' : 'יש לך חשבון? '}
            <button
              type="button"
              onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              className="text-[#9FEF00] hover:underline"
            >
              {tab === 'login' ? 'הירשם עכשיו' : 'כניסה'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
