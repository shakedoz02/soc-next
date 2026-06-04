import { useRef, useEffect, memo } from 'react';

const LINE_COLORS = {
  system: 'text-slate-500',
  input: 'text-slate-300',
  output: 'text-slate-400',
  success: 'text-[#9FEF00]',
  error: 'text-red-400',
};

const QUICK_CMDS = ['help', 'whois <IP>', 'fw-block <IP>', 'close-ticket'];

function TerminalLine({ line, index }) {
  if (line.type !== 'prompt') {
    return (
      <div className={LINE_COLORS[line.type] || 'text-slate-400'} dir="ltr">
        {line.text}
      </div>
    );
  }
  return null; // prompt row handled by the parent
}

const MemoTerminalLine = memo(TerminalLine);

export default function TerminalPanel({ history, input, onInputChange, onKeyDown, onCommand, finished }) {
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleQuickCmd = (cmd) => {
    if (!cmd.includes('<IP>')) {
      onCommand(cmd);
    } else {
      onInputChange(cmd.replace(' <IP>', ' '));
      inputRef.current?.focus();
    }
  };

  return (
    <section
      className="h-64 bg-[#0D1117] flex flex-col overflow-hidden flex-shrink-0"
      aria-label="טרמינל פקודות"
    >
      {/* Terminal title bar */}
      <div className="px-4 py-2 bg-[#0D1117] border-b border-[#1C2536] flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-[#9FEF00]/60" />
        </div>
        <span className="material-symbols-outlined text-[#9FEF00] text-sm" aria-hidden="true">terminal</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-technical-mono">
          Shell Terminal — root@soc-station-01: ~
        </span>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        role="log"
        aria-live="polite"
        aria-label="פלט טרמינל"
        className="flex-1 overflow-y-auto p-5 font-technical-mono text-xs leading-relaxed custom-scrollbar"
        onClick={() => inputRef.current?.focus()}
        dir="ltr"
      >
        {history.map((line, i) => {
          if (line.type === 'prompt') {
            return (
              <div key={i} className="flex items-center gap-1 mt-1">
                <span className="text-[#9FEF00]">analyst@unit01</span>
                <span className="text-blue-400">:~</span>
                <span className="text-slate-300">$&nbsp;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => onInputChange(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="flex-1 bg-transparent outline-none text-[#9FEF00] caret-[#9FEF00] font-technical-mono"
                  aria-label="הזן פקודה"
                  autoFocus
                  disabled={finished}
                  dir="ltr"
                />
              </div>
            );
          }
          return <MemoTerminalLine key={i} line={line} index={i} />;
        })}
      </div>

      {/* Quick commands */}
      {!finished && (
        <div className="border-t border-[#1C2536] p-3 flex-shrink-0 bg-[#0D1117]">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-2 font-technical-mono">
            פקודות מהירות
          </div>
          <div className="flex flex-wrap gap-2" role="toolbar" aria-label="פקודות מהירות">
            {QUICK_CMDS.map(cmd => (
              <button
                key={cmd}
                onClick={() => handleQuickCmd(cmd)}
                aria-label={`הפעל פקודה: ${cmd}`}
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
  );
}
