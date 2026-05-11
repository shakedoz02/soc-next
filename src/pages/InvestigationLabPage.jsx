import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { SCENARIOS } from '../data/scenarios';
import { useAuth } from '../contexts/AuthContext';

const LOG_LEVEL_COLORS = {
  CRITICAL: 'text-red-400',
  ERROR: 'text-orange-400',
  WARN: 'text-yellow-400',
  INFO: 'text-slate-400',
};

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function InvestigationLabPage() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { addXP } = useAuth();
  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', text: `SOC-Next Terminal v2.4 — Scenario: ${scenario?.title || 'Unknown'}` },
    { type: 'system', text: 'Type "help" for available commands. Good luck, analyst.' },
    { type: 'prompt', text: '' },
  ]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [score, setScore] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [activeLog, setActiveLog] = useState(null);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  if (!scenario) return <Navigate to="/alerts" replace />;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const HELP_TEXT = [
    'פקודות זמינות:',
    '  fw-block <IP>       — חסימת כתובת IP בחומת האש',
    '  isolate-host <IP>   — בידוד מארח מהרשת',
    '  kill-session <IP>   — ביטול סשן פעיל',
    '  whois <IP>          — מידע על כתובת IP',
    '  scan <IP>           — סריקת פורטים פתוחים',
    '  close-ticket        — סגירת הכרטיס וסיום החקירה',
    '  help                — הצגת עזרה',
  ];

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const parts = trimmed.split(' ');
    const command = parts[0];
    const arg = parts[1] || '';

    const newLines = [{ type: 'input', text: `$ ${cmd}` }];

    if (!trimmed) {
      setTerminalHistory(h => [...h.slice(0, -1), ...newLines, { type: 'prompt', text: '' }]);
      return;
    }

    if (command === 'help') {
      HELP_TEXT.forEach(t => newLines.push({ type: 'output', text: t }));
    } else if (command === 'whois') {
      if (!arg) {
        newLines.push({ type: 'error', text: 'שגיאה: נדרש כתובת IP. דוגמה: whois 192.168.1.1' });
      } else {
        newLines.push({ type: 'output', text: `WHOIS ${arg}:` });
        newLines.push({ type: 'output', text: `  Organization: Unknown / Suspicious` });
        newLines.push({ type: 'output', text: `  Country: [REDACTED]` });
        newLines.push({ type: 'output', text: `  Threat Score: HIGH` });
      }
    } else if (command === 'scan') {
      if (!arg) {
        newLines.push({ type: 'error', text: 'שגיאה: נדרש כתובת IP.' });
      } else {
        newLines.push({ type: 'output', text: `Scanning ${arg}...` });
        newLines.push({ type: 'output', text: `  PORT   STATE  SERVICE` });
        newLines.push({ type: 'output', text: `  22/tcp open   ssh` });
        newLines.push({ type: 'output', text: `  80/tcp open   http` });
        newLines.push({ type: 'output', text: `  443/tcp open   https` });
      }
    } else if (['fw-block', 'isolate-host', 'kill-session'].includes(command)) {
      if (!arg) {
        newLines.push({ type: 'error', text: `שגיאה: נדרש כתובת IP. דוגמה: ${command} <IP>` });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        const isCorrect = scenario.solution.keywords.some(k => arg.includes(k));
        if (isCorrect) {
          newLines.push({ type: 'success', text: `✔ ${command.toUpperCase()} ${arg} — בוצע בהצלחה` });
          newLines.push({ type: 'success', text: `  ► כתובת IP ${arg} נחסמה בחומת האש` });

          const argTrimmed = arg.trim();
          const matchedCmd = scenario.solution.commands.find(c =>
            c.toLowerCase().includes(command) && c.toLowerCase().includes(argTrimmed.toLowerCase())
          );
          if (matchedCmd && !completedSteps.includes(matchedCmd)) {
            const nextSteps = [...completedSteps, matchedCmd];
            const stepIdx = Math.min(nextSteps.length - 1, scenario.playbook.length - 1);
            newLines.push({ type: 'success', text: `  ► שלב ${stepIdx + 1} הושלם: ${scenario.playbook[stepIdx]?.title}` });
            setCompletedSteps(nextSteps);
          }
        } else {
          newLines.push({ type: 'error', text: `✘ ${command.toUpperCase()} ${arg} — כתובת IP שגויה` });
          newLines.push({ type: 'error', text: `  ► בדוק את הלוגים שוב ומצא את כתובת התוקף` });
          setScore(s => Math.max(0, s - 15));
          setMistakes(m => m + 1);
        }
      }
    } else if (command === 'close-ticket') {
      clearInterval(timerRef.current);
      const allDone = scenario.solution.commands.every(c =>
        completedSteps.some(cs => cs.includes(c.split(' ')[0]))
      );
      if (allDone || completedSteps.length > 0) {
        newLines.push({ type: 'success', text: '✔ הכרטיס נסגר. הכנסת דו"ח לממונה.' });
        newLines.push({ type: 'success', text: `  ► ניקוד סופי: ${Math.max(0, score - mistakes * 5)}` });
        setFinished(true);
        addXP(Math.round(scenario.xpReward * (score / 100)));
        setTimeout(() => navigate(`/summary/${scenarioId}`, {
          state: {
            score: Math.max(0, score - mistakes * 5),
            xpEarned: Math.round(scenario.xpReward * (score / 100)),
            elapsed,
            mistakes,
            commands: completedSteps,
            scenario,
          }
        }), 2000);
      } else {
        newLines.push({ type: 'error', text: '✘ לא ניתן לסגור — טרם בוצעו פעולות בלימה.' });
        newLines.push({ type: 'error', text: '  ► בצע את הפעולות הנדרשות ואז נסה שוב.' });
        setScore(s => Math.max(0, s - 10));
      }
    } else {
      newLines.push({ type: 'error', text: `פקודה לא מוכרת: "${command}". הקלד "help" לרשימת פקודות.` });
      setScore(s => Math.max(0, s - 5));
      setMistakes(m => m + 1);
    }

    setTerminalHistory(h => [...h.slice(0, -1), ...newLines, { type: 'prompt', text: '' }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(terminalInput);
      setTerminalInput('');
    }
  };

  const currentScore = Math.max(0, score - mistakes * 5);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col font-assistant">
      {/* Lab Sub-Header */}
      <div className="bg-[#111927] border-b border-[#1C2536] px-6 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#9FEF00]">security</span>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">{scenario.titleHe}</span>
            <span className="text-slate-500 text-[10px] font-technical-mono uppercase tracking-widest">
              Scenario ID: {scenarioId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">זמן נותר</span>
              <span className="font-technical-mono text-[#9FEF00] text-lg">{formatTime(elapsed)}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">ניקוד</span>
              <span className={`font-technical-mono text-lg font-bold ${currentScore >= 70 ? 'text-[#9FEF00]' : currentScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {currentScore}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">שגיאות</span>
              <span className="font-technical-mono text-red-400 text-lg">{mistakes}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="border border-[#1C2536] text-slate-400 px-3 py-1.5 rounded text-xs hover:text-white hover:border-slate-500 transition-colors"
          >
            יציאה
          </button>
        </div>
      </div>

      {/* Main Layout: Main workspace + Playbook aside */}
      <div className="flex flex-1 overflow-hidden" dir="ltr">

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* SIEM Logs Table */}
          <section className="flex-1 bg-[#1C2536] border-b border-[#1C2536] flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-[#111927] border-b border-[#1C2536] flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-sm">database</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest font-technical-mono">
                  SIEM Logs Viewer — {scenario.title}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#9FEF00]" />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#0D1117]">
              <table className="w-full text-left border-collapse font-technical-mono text-sm">
                <thead className="sticky top-0 bg-[#0D1117] z-10">
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                    <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider whitespace-nowrap">Source</th>
                    <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Level</th>
                    <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {scenario.logs.map((log) => {
                    const isActive = activeLog?.id === log.id;
                    const isCritical = log.level === 'CRITICAL' || log.level === 'ERROR';
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setActiveLog(isActive ? null : log)}
                        className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[#9FEF00]/5 border-[#9FEF00]/20'
                            : isCritical
                            ? 'hover:bg-red-500/5'
                            : 'hover:bg-[#1C2536]'
                        }`}
                      >
                        <td className="px-4 py-2 text-slate-500 whitespace-nowrap text-xs">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-xs font-bold ${isCritical ? 'text-red-400' : 'text-[#9FEF00]'}`}>
                          {log.source}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] font-bold ${LOG_LEVEL_COLORS[log.level] || 'text-slate-400'}`}>
                            [{log.level}]
                          </span>
                        </td>
                        <td className={`px-4 py-2 text-xs leading-relaxed ${isCritical ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                          {log.message}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Shell Terminal */}
          <section className="h-64 bg-[#0D1117] flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-2 bg-[#0D1117] border-b border-[#1C2536] flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-[#9FEF00]/60" />
                </div>
                <span className="material-symbols-outlined text-[#9FEF00] text-sm">terminal</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-technical-mono">
                  Shell Terminal — root@soc-station-01: ~
                </span>
              </div>
            </div>

            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-5 font-technical-mono text-xs leading-relaxed custom-scrollbar"
              onClick={() => inputRef.current?.focus()}
              dir="ltr"
            >
              {terminalHistory.map((line, i) => {
                if (line.type === 'prompt') {
                  return (
                    <div key={i} className="flex items-center gap-1 mt-1">
                      <span className="text-[#9FEF00]">analyst@unit01</span>
                      <span className="text-blue-400">:~</span>
                      <span className="text-slate-300">$&nbsp;</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={terminalInput}
                        onChange={e => setTerminalInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent outline-none text-[#9FEF00] caret-[#9FEF00] font-technical-mono"
                        autoFocus
                        disabled={finished}
                        dir="ltr"
                      />
                    </div>
                  );
                }

                const colorMap = {
                  system: 'text-slate-500',
                  input: 'text-slate-300',
                  output: 'text-slate-400',
                  success: 'text-[#9FEF00]',
                  error: 'text-red-400',
                };

                return (
                  <div key={i} className={colorMap[line.type] || 'text-slate-400'} dir="ltr">
                    {line.text}
                  </div>
                );
              })}
            </div>

            {!finished && (
              <div className="border-t border-[#1C2536] p-3 flex-shrink-0 bg-[#0D1117]">
                <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-2 font-technical-mono">פקודות מהירות</div>
                <div className="flex flex-wrap gap-2">
                  {['help', 'whois <IP>', 'fw-block <IP>', 'close-ticket'].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => {
                        if (!cmd.includes('<IP>')) {
                          handleCommand(cmd);
                        } else {
                          setTerminalInput(cmd.replace(' <IP>', ' '));
                          inputRef.current?.focus();
                        }
                      }}
                      className="font-technical-mono text-[10px] px-2 py-1 border border-[#1C2536] text-slate-400 hover:border-[#9FEF00]/50 hover:text-[#9FEF00] rounded transition-all"
                      dir="ltr"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Playbook Aside */}
        <aside className="w-64 border-l border-[#1C2536] flex flex-col bg-[#111927] flex-shrink-0" dir="rtl">
          <div className="px-4 py-3 border-b border-[#1C2536] bg-[#1C2536]/50 flex-shrink-0">
            <h3 className="text-sm font-bold text-[#9FEF00] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">assignment</span>
              Playbook: {scenario.titleHe}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <div className="space-y-3">
              {scenario.playbook.map((step, idx) => {
                const isDone = completedSteps.length > idx;
                const isCurrent = completedSteps.length === idx;
                return (
                  <div key={step.step} className="flex items-start gap-3">
                    {isDone ? (
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mt-1 accent-[#9FEF00] cursor-default"
                      />
                    ) : isCurrent ? (
                      <div className="mt-1 w-4 h-4 border-2 border-[#9FEF00] rounded flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-[#9FEF00]" />
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        disabled
                        className="mt-1 opacity-50 cursor-default"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className={`text-sm ${isDone ? 'text-slate-400 line-through' : isCurrent ? 'text-[#9FEF00] font-bold' : 'text-slate-500'}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {isDone ? 'הושלם בהצלחה' : isCurrent ? 'משימה נוכחית' : 'שלב נעול'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#1C2536]">
              {(() => {
                const tipIdx = Math.min(completedSteps.length, scenario.playbook.length - 1);
                const currentStep = scenario.playbook[tipIdx];
                return (
                  <div className="bg-[#1C2536]/50 p-3 rounded border border-[#1C2536]">
                    <span className="text-[10px] text-[#9FEF00] font-technical-mono uppercase block mb-1">
                      שלב {tipIdx + 1}: {currentStep?.title}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentStep?.description}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="p-4 border-t border-[#1C2536] flex-shrink-0">
            <button
              onClick={() => handleCommand('close-ticket')}
              disabled={finished}
              className="w-full bg-[#9FEF00] text-[#111927] py-2 font-bold text-sm uppercase tracking-tighter hover:bg-[#a8f91a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              סגירת אירוע
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
