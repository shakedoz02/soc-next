import { memo, useState, useEffect } from 'react';

function renderDescription(text) {
  if (!text) return null;
  return text.split(/(<\w+>)/g).map((part, i) =>
    /^<\w+>$/.test(part) ? <span key={i} dir="ltr">{part}</span> : part
  );
}

function PlaybookStep({ step, isDone, isCurrent }) {
  return (
    <div className="flex items-start gap-3" role="listitem">
      <div className="mt-1 flex-shrink-0" aria-hidden="true">
        {isDone ? (
          <input type="checkbox" checked readOnly className="accent-[#9FEF00] cursor-default" />
        ) : isCurrent ? (
          <div className="w-4 h-4 border-2 border-[#9FEF00] rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-[#9FEF00]" />
          </div>
        ) : (
          <input type="checkbox" disabled className="opacity-50 cursor-default" />
        )}
      </div>
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
}

const MemoPlaybookStep = memo(PlaybookStep);

function parseDescription(description) {
  if (!description) return { hint: null, command: null };
  const sepIdx = description.indexOf(' — ');
  if (sepIdx === -1) return { hint: description, command: null };
  return {
    hint: description.slice(0, sepIdx).trim(),
    command: description.slice(sepIdx + 3).trim(),
  };
}

export default function PlaybookPanel({ scenario, completedSteps, onCloseTicket, finished }) {
  const [showCommand, setShowCommand] = useState(false);

  // completedSteps is an array of 0-based step indices that have been completed
  const firstUndoneIdx = scenario.playbook.findIndex((_, i) => !completedSteps.includes(i));
  const tipIdx = firstUndoneIdx >= 0 ? firstUndoneIdx : scenario.playbook.length - 1;
  const currentTip = scenario.playbook[tipIdx];
  const { hint, command } = parseDescription(currentTip?.description);

  useEffect(() => { setShowCommand(false); }, [tipIdx]);

  return (
    <aside
      className="w-64 border-l border-[#1C2536] flex flex-col bg-[#111927] flex-shrink-0"
      dir="rtl"
      aria-label="ספר פעולות"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1C2536] bg-[#1C2536]/50 flex-shrink-0">
        <h3 className="text-sm font-bold text-[#9FEF00] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">assignment</span>
          Playbook: {scenario.titleHe}
        </h3>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <ol className="space-y-3 list-none" aria-label="שלבי החקירה">
          {scenario.playbook.map((step, idx) => (
            <MemoPlaybookStep
              key={step.step}
              step={step}
              isDone={completedSteps.includes(idx)}
              isCurrent={!completedSteps.includes(idx) && idx === firstUndoneIdx}
            />
          ))}
        </ol>

        {/* Current tip box */}
        <div className="pt-4 border-t border-[#1C2536]">
          <span className="text-[10px] text-[#9FEF00] font-technical-mono uppercase block mb-2">
            שלב {tipIdx + 1}: {currentTip?.title}
          </span>
          <div className="bg-[#1C2536]/50 p-3 rounded border border-[#1C2536]" role="status" aria-live="polite">
            <p className="text-xs text-slate-300 leading-relaxed">
              {renderDescription(hint)}
            </p>
            {command && (
              <div className="mt-2">
                <button
                  onClick={() => setShowCommand(v => !v)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showCommand ? 'הסתר רמז' : '💡 רמז'}
                </button>
                {showCommand && (() => {
                  const colonIdx = command.indexOf(': ');
                  const label = colonIdx !== -1 ? command.slice(0, colonIdx + 1) : null;
                  const cmdText = colonIdx !== -1 ? command.slice(colonIdx + 2) : command;
                  return (
                    <div className="mt-1">
                      {label && <span className="text-xs text-yellow-300">{label}</span>}
                      <p className="text-xs text-yellow-300 leading-relaxed" dir="ltr">
                        {renderDescription(cmdText)}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      <div className="p-4 border-t border-[#1C2536] flex-shrink-0">
        <button
          onClick={onCloseTicket}
          disabled={finished}
          aria-label="סגור אירוע ועבור לדוח"
          className="w-full bg-[#9FEF00] text-[#111927] py-2 font-bold text-sm uppercase tracking-tighter hover:bg-[#a8f91a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          סגירת אירוע
        </button>
      </div>
    </aside>
  );
}
