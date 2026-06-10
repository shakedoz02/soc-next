import { useRef, useEffect, memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINE_COLORS = {
  system: 'text-slate-500',
  input: 'text-slate-300',
  output: 'text-slate-400',
  success: 'text-[#9FEF00]',
  error: 'text-red-400',
};

const QUICK_CMDS = [
  'help',
  'scan <IP>',
  'whois <IP>',
  'port-info',
  'fw-block <IP>',
  'isolate-host <IP>',
  'close-ticket',
];

const ADVANCED_CMDS = [
  'kill-session <IP>',
  'reset-password <user>',
  'disable-account <user>',
  'block-url <URL>',
  'quarantine <file>',
];

const cmdVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.18, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: 4, scale: 0.95, transition: { duration: 0.1 } },
};

function TerminalLine({ line }) {
  if (line.type !== 'prompt') {
    return (
      <div className={LINE_COLORS[line.type] || 'text-slate-400'} dir="ltr">
        {line.text}
      </div>
    );
  }
  return null;
}

const MemoTerminalLine = memo(TerminalLine);

export default function TerminalPanel({ history, input, onInputChange, onKeyDown, onCommand, finished }) {
  const terminalRef = useRef(null);
  const inputRef    = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleQuickCmd = (cmd) => {
    const hasPlaceholder = /<(IP|user|URL|file)>/.test(cmd);
    if (!hasPlaceholder) {
      onCommand(cmd);
    } else {
      onInputChange(cmd.replace(/ <(IP|user|URL|file)>/, ' '));
      inputRef.current?.focus();
    }
  };

  return (
    <section
      className="bg-[#0D1117] flex flex-col overflow-hidden flex-shrink-0"
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
        className="h-48 overflow-y-auto p-5 font-technical-mono text-xs leading-relaxed custom-scrollbar"
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
          return <MemoTerminalLine key={i} line={line} />;
        })}
      </div>

      {/* Quick commands */}
      {!finished && (
        <div className="border-t border-[#1C2536] px-3 pt-2 pb-3 flex-shrink-0 bg-[#0D1117]">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-2 font-technical-mono">
            פקודות מהירות
          </div>

          {/* Primary row */}
          <div className="flex flex-wrap gap-2 items-center" role="toolbar" aria-label="פקודות מהירות">
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

            {/* Toggle button */}
            <motion.button
              onClick={() => setExpanded(v => !v)}
              aria-label={expanded ? 'סגור פקודות מתקדמות' : 'הצג פקודות מתקדמות'}
              className="font-technical-mono text-[10px] px-2 py-1 border border-[#1C2536] text-slate-500 hover:border-slate-500/60 hover:text-slate-300 rounded transition-all ml-1"
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              dir="ltr"
            >
              ···
            </motion.button>
          </div>

          {/* Advanced commands row */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                key="advanced"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[#1C2536]/60" role="toolbar" aria-label="פקודות מתקדמות">
                  {ADVANCED_CMDS.map((cmd, i) => (
                    <motion.button
                      key={cmd}
                      custom={i}
                      variants={cmdVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onClick={() => handleQuickCmd(cmd)}
                      aria-label={`הפעל פקודה: ${cmd}`}
                      className="font-technical-mono text-[10px] px-2 py-1 border border-slate-700/50 text-slate-500 hover:border-slate-400/50 hover:text-slate-300 rounded transition-all"
                      dir="ltr"
                    >
                      {cmd}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
