import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { toast } from '../components/Toast';
import { SCENARIOS } from '../data/scenarios';
import { useAuth } from '../contexts/AuthContext';
import { useTerminal } from '../hooks/useTerminal';
import { useInvestigationTimer } from '../hooks/useInvestigationTimer';
import { useScenarioVariant } from '../hooks/useScenarioVariant';
import SiemLogsViewer from '../components/investigation/SiemLogsViewer';
import TerminalPanel from '../components/investigation/TerminalPanel';
import PlaybookPanel from '../components/investigation/PlaybookPanel';

export default function InvestigationLabPage() {
  const { scenarioId }             = useParams();
  const navigate                   = useNavigate();
  const { saveInvestigation, user } = useAuth();
  const [activeLog, setActiveLog]  = useState(null);
  const savedRef                   = useRef(false); // prevent double-save on StrictMode

  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  const { variant, logs: variantLogs, loading: variantLoading, error: variantError } =
    useScenarioVariant(scenarioId, user?.level ?? 1);

  const runtimeScenario = useMemo(() => {
    if (!scenario || !variant) return null;
    return {
      ...scenario,
      logs: variantLogs,
      attackerIP: variant.attacker_ip,
      solution: {
        commands: variant.solution_commands,
        keywords: variant.solution_keywords,
      },
    };
  }, [scenario, variant, variantLogs]);

  const terminal     = useTerminal(runtimeScenario);
  const timer        = useInvestigationTimer(!terminal.finished);

  // React to terminal.finished becoming true (avoids stale-closure / circular-dep)
  useEffect(() => {
    if (!terminal.finished || !terminal.finalState || savedRef.current) return;
    savedRef.current = true;

    const { score, mistakes, commands } = terminal.finalState;
    const xpEarned = Math.round(scenario.xpReward * (score / 100));

    timer.stop();

    saveInvestigation({
      scenarioId,
      scenarioTitle: scenario.titleHe,
      score,
      xpEarned,
      elapsed: timer.elapsedRef.current,
      mistakes,
      commands,
    }).then(({ error }) => {
      if (error) toast.error('שגיאה בשמירת התוצאות');
    });

    setTimeout(() => {
      navigate(`/summary/${scenarioId}`, {
        state: {
          score,
          xpEarned,
          elapsed:  timer.elapsedRef.current,
          mistakes,
          commands,
          scenario,
        },
      });
    }, 1800);
  }, [terminal.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!scenario) return <Navigate to="/alerts" replace />;

  if (variantError) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 font-assistant bg-[#0D1117]">
        <span className="material-symbols-outlined text-red-400 text-4xl">error</span>
        <p className="text-red-400 text-sm font-technical-mono">{variantError}</p>
        <button
          onClick={() => navigate('/alerts')}
          className="border border-[#1C2536] text-slate-400 px-4 py-2 rounded text-xs hover:text-white hover:border-slate-500 transition-colors"
        >
          חזרה לאזעקות
        </button>
      </div>
    );
  }

  if (variantLoading || !runtimeScenario) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 font-assistant bg-[#0D1117]">
        <span className="material-symbols-outlined text-[#9FEF00] text-4xl animate-spin">progress_activity</span>
        <p className="text-slate-400 text-sm font-technical-mono tracking-widest uppercase">טוען תרחיש...</p>
      </div>
    );
  }

  const scoreColor =
    terminal.score >= 70 ? 'text-[#9FEF00]' :
    terminal.score >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col font-assistant">
      {/* Sub-header */}
      <div className="bg-[#111927] border-b border-[#1C2536] px-6 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#9FEF00]" aria-hidden="true">security</span>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">{scenario.titleHe}</span>
            <span className="text-slate-500 text-[10px] font-technical-mono uppercase tracking-widest">
              Analyst: {user?.name} · Scenario: {scenarioId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6" role="status" aria-label="מצב חקירה">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">זמן</span>
              <span className="font-technical-mono text-[#9FEF00] text-lg">
                {timer.formatTime(timer.elapsed)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">ניקוד</span>
              <span className={`font-technical-mono text-lg font-bold ${scoreColor}`}>
                {terminal.firstCommandExecuted ? terminal.score : '--'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">שגיאות</span>
              <span className="font-technical-mono text-red-400 text-lg">{terminal.mistakes}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/alerts')}
            aria-label="יציאה מהחקירה"
            className="border border-[#1C2536] text-slate-400 px-3 py-1.5 rounded text-xs hover:text-white hover:border-slate-500 transition-colors"
          >
            יציאה
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden" dir="ltr">
        <div className="flex-1 flex flex-col overflow-hidden">
          <SiemLogsViewer
            scenario={runtimeScenario}
            activeLog={activeLog}
            onLogSelect={setActiveLog}
          />
          <TerminalPanel
            history={terminal.history}
            input={terminal.input}
            onInputChange={terminal.setInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                terminal.handleCommand(terminal.input);
                terminal.setInput('');
              }
            }}
            onCommand={terminal.handleCommand}
            finished={terminal.finished}
          />
        </div>

        <PlaybookPanel
          scenario={scenario}
          completedSteps={terminal.completedSteps}
          onCloseTicket={() => terminal.handleCommand('close-ticket')}
          finished={terminal.finished}
        />
      </div>
    </div>
  );
}
