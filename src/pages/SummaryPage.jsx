import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SCENARIOS } from '../data/scenarios';
import jsPDF from 'jspdf';
import StatCard from '../components/ui/StatCard';
import PrimaryButton from '../components/ui/PrimaryButton';

function CircularScore({ score }) {
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#9FEF00' : score >= 50 ? '#F59E0B' : '#FF4D4D';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="relative w-64 h-64" role="img" aria-label={`ציון סופי: ${score} — ${label}`}>
      <svg className="w-full h-full" viewBox="0 0 256 256" aria-hidden="true">
        <circle cx="128" cy="128" r={radius} fill="transparent" stroke="#111927" strokeWidth="12" />
        <circle
          cx="128" cy="128" r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring__circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-7xl font-black" style={{ color }}>{score}</span>
        <span className="text-slate-500 font-technical-mono text-sm tracking-widest uppercase">{label}</span>
      </div>
    </div>
  );
}

function ActivityChart() {
  return (
    <div className="bg-[#1C2536] border border-[#1C2536] p-6 rounded-lg relative overflow-hidden group h-52" aria-hidden="true">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] text-slate-500 uppercase tracking-widest font-technical-mono">Activity Over Time</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9FEF00]" />
            <span className="text-[10px] text-slate-500 font-technical-mono">EVENTS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-[10px] text-slate-500 font-technical-mono">BASELINE</span>
          </div>
        </div>
      </div>
      <div className="w-full h-24 relative">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
          <defs>
            <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9FEF00" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M0 35 Q 10 20, 20 30 T 40 15 T 60 25 T 80 10 T 100 20" fill="none" stroke="#9FEF00" strokeWidth="1.5" className="group-hover:stroke-2 transition-all duration-300" />
          <path d="M0 35 Q 10 20, 20 30 T 40 15 T 60 25 T 80 10 T 100 20 V 40 H 0 Z" fill="url(#chart-gradient)" opacity="0.1" />
        </svg>
      </div>
      <div className="flex justify-between text-[8px] text-slate-600 font-technical-mono uppercase mt-1">
        <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const { scenarioId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  const state = location.state ?? {
    score: 85,
    xpEarned: 425,
    elapsed: 1247,
    mistakes: 1,
    commands: ['fw-block 192.168.1.105'],
    scenario,
  };

  const { score, xpEarned, elapsed, mistakes, commands } = state;
  const accuracy = Math.max(0, 100 - mistakes * 10);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();

    doc.setFillColor(17, 25, 39);
    doc.rect(0, 0, pw, 297, 'F');

    doc.setTextColor(159, 239, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SOC-Next', 20, 25);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Shift Investigation Report', 20, 32);

    doc.setDrawColor(28, 37, 54);
    doc.setLineWidth(0.5);
    doc.line(20, 36, pw - 20, 36);

    doc.setTextColor(243, 244, 246);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Scenario: ${scenario?.title || 'N/A'}`, 20, 50);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Analyst: ${user?.name || 'Analyst'}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 67);
    doc.text(`Session Time: ${formatTime(elapsed)}`, 20, 74);

    doc.line(20, 80, pw - 20, 80);

    doc.setTextColor(243, 244, 246);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Metrics', 20, 92);

    const metrics = [
      ['Final Score', `${score}/100`],
      ['XP Earned', `+${xpEarned}`],
      ['Session Time', formatTime(elapsed)],
      ['Accuracy', `${accuracy}%`],
      ['Mistakes', String(mistakes)],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    metrics.forEach(([k, v], i) => {
      doc.setTextColor(148, 163, 184);
      doc.text(k + ':', 20, 103 + i * 8);
      doc.setTextColor(score >= 80 ? 159 : 243, score >= 80 ? 239 : 244, score >= 80 ? 0 : 246);
      doc.text(v, 80, 103 + i * 8);
    });

    doc.setDrawColor(28, 37, 54);
    doc.line(20, 148, pw - 20, 148);

    doc.setTextColor(243, 244, 246);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Actions Executed', 20, 160);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (commands?.length > 0) {
      commands.forEach((cmd, i) => {
        doc.setTextColor(159, 239, 0);
        doc.text(`$ ${cmd}`, 25, 170 + i * 8);
      });
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('No commands recorded', 25, 170);
    }

    doc.line(20, 200, pw - 20, 200);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text('© 2024 SOC-Next Technical Operations — Restricted Access', 20, 285);
    doc.text(`Report ID: RPT-${Date.now()}`, pw - 60, 285);

    doc.save(`soc-next-report-${scenarioId}-${Date.now()}.pdf`);
  };

  return (
    <div className="p-8 custom-scrollbar overflow-y-auto font-assistant">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#9FEF00] text-[#9FEF00] mb-4 font-technical-mono text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>
          משימה הושלמה
        </div>
        <h1 className="text-4xl font-black text-white mb-2">המשמרת הסתיימה בהצלחה</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          כל הכבוד, {user?.name || 'אנליסט'}. ביצועי המשמרת שלך היו מעל הממוצע הנדרש.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6 items-start max-w-5xl mx-auto">

        {/* Score ring */}
        <div className="col-span-12 lg:col-span-5 bg-[#1C2536] border border-[#1C2536] p-8 rounded-lg flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-[10px] font-technical-mono text-slate-500 mb-8 uppercase tracking-[0.2em]">ציון סופי</h3>
          <CircularScore score={score} />
          <div className="mt-8 flex gap-8">
            <div className="text-center">
              <div className="text-slate-500 text-[10px] font-technical-mono uppercase mb-1">Target</div>
              <div className="text-slate-200 font-technical-mono">75</div>
            </div>
            <div className="w-px h-8 bg-slate-700" aria-hidden="true" />
            <div className="text-center">
              <div className="text-slate-500 text-[10px] font-technical-mono uppercase mb-1">XP Earned</div>
              <div className="text-[#9FEF00] font-technical-mono">+{xpEarned}</div>
            </div>
          </div>
        </div>

        {/* Stats + chart */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: 'stars', label: 'XP Gained', value: `+${xpEarned.toLocaleString()}`, color: 'text-white' },
              { icon: 'schedule', label: 'Shift Time', value: formatTime(elapsed), color: 'text-white' },
              { icon: 'verified', label: 'Accuracy', value: `${accuracy}%`, color: 'text-[#9FEF00]' },
            ].map(({ icon, label, value, color }) => (
              <StatCard
                key={label}
                icon={icon}
                label={label}
                value={value}
                color={color}
                className="border border-[#1C2536] p-6 hover:border-[#9FEF00]/40 transition-all duration-300"
                labelClassName="font-technical-mono"
              />
            ))}
          </div>
          <ActivityChart />
        </div>

        {/* Footer actions */}
        <div className="col-span-12 bg-[#1C2536] border border-[#1C2536] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex -space-x-3 rtl:space-x-reverse" aria-hidden="true">
              <div className="w-10 h-10 rounded-full border-2 border-[#1C2536] bg-slate-800 flex items-center justify-center text-xs font-bold text-white">JD</div>
              <div className="w-10 h-10 rounded-full border-2 border-[#1C2536] bg-slate-700 flex items-center justify-center text-xs font-bold text-white">AL</div>
              <div className="w-10 h-10 rounded-full border-2 border-[#1C2536] bg-[#111927] flex items-center justify-center text-xs text-slate-500">+3</div>
            </div>
            <p className="text-sm text-slate-400">משמרת זו אושרה על ידי 5 מפקחים שונים.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate('/lobby')}
              className="flex-1 md:flex-none px-6 py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors text-center"
            >
              חזרה ללובי
            </button>
            <PrimaryButton
              onClick={handleDownloadPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 cyber-glow duration-100"
              aria-label="הורד דוח PDF"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
              הורדת דו&quot;ח PDF
            </PrimaryButton>
          </div>
        </div>

        {/* Doc cards */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'description', label: 'פרוטוקול תחקיר', sub: 'פירוט מלא של כל שלבי החקירה.' },
            { icon: 'terminal', label: 'לוגים גולמיים', sub: 'היסטוריית פקודות מלאה מהטרמינל.' },
            { icon: 'emergency', label: 'אירועים קריטיים', sub: 'סיכום אירועי האבטחה המרכזיים.' },
            { icon: 'military_tech', label: 'עיטורי הצטיינות', sub: 'המדליות והבונוסים שנצברו.' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="p-4 bg-[#111927] border border-[#1C2536] rounded group cursor-pointer hover:bg-[#1C2536] transition-colors" tabIndex={0} role="button" aria-label={label}>
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-[#9FEF00]" aria-hidden="true">{icon}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-1">{label}</h4>
              <p className="text-[11px] text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
