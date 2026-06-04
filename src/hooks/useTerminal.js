import { useState, useCallback } from 'react';

const HELP_LINES = [
  'פקודות זמינות:',
  '  fw-block <IP>       — חסימת כתובת IP בחומת האש',
  '  isolate-host <IP>   — בידוד מארח מהרשת',
  '  kill-session <IP>   — ביטול סשן פעיל',
  '  whois <IP>          — מידע על כתובת IP',
  '  scan <IP>           — סריקת פורטים פתוחים',
  '  close-ticket        — סגירת הכרטיס וסיום החקירה',
  '  help                — הצגת עזרה',
];

const BLOCK_COMMANDS = ['fw-block', 'isolate-host', 'kill-session'];

// Exposed when close-ticket succeeds so the page can react without a callback
// { score, mistakes, commands }
const INITIAL_FINAL = null;

export function useTerminal(scenario) {
  const [history, setHistory] = useState([
    { type: 'system', text: `SOC-Next Terminal v2.4 — Scenario: ${scenario?.title || 'Unknown'}` },
    { type: 'system', text: 'Type "help" for available commands. Good luck, analyst.' },
    { type: 'prompt', text: '' },
  ]);
  const [input, setInput]               = useState('');
  const [score, setScore]               = useState(100);
  const [mistakes, setMistakes]         = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [finished, setFinished]         = useState(false);
  const [finalState, setFinalState]     = useState(INITIAL_FINAL);

  const push = (lines) =>
    setHistory(h => [...h.slice(0, -1), ...lines, { type: 'prompt', text: '' }]);

  const handleCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      push([{ type: 'input', text: `$ ${cmd}` }]);
      return;
    }

    const parts   = trimmed.toLowerCase().split(' ');
    const command = parts[0];
    const arg     = parts[1] || '';
    const lines   = [{ type: 'input', text: `$ ${cmd}` }];

    if (command === 'help') {
      HELP_LINES.forEach(t => lines.push({ type: 'output', text: t }));

    } else if (command === 'whois') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש כתובת IP. דוגמה: whois 192.168.1.1' });
      } else {
        lines.push({ type: 'output', text: `WHOIS ${arg}:` });
        lines.push({ type: 'output', text: '  Organization: Unknown / Suspicious' });
        lines.push({ type: 'output', text: '  Country: [REDACTED]' });
        lines.push({ type: 'output', text: '  Threat Score: HIGH' });
      }

    } else if (command === 'scan') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש כתובת IP.' });
      } else {
        lines.push({ type: 'output', text: `Scanning ${arg}...` });
        lines.push({ type: 'output', text: '  PORT   STATE  SERVICE' });
        lines.push({ type: 'output', text: '  22/tcp  open   ssh' });
        lines.push({ type: 'output', text: '  80/tcp  open   http' });
        lines.push({ type: 'output', text: '  443/tcp open   https' });
      }

    } else if (BLOCK_COMMANDS.includes(command)) {
      if (!arg) {
        lines.push({ type: 'error', text: `שגיאה: נדרש כתובת IP. דוגמה: ${command} <IP>` });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        const isCorrect = scenario.solution.keywords.some(k => arg.includes(k));
        if (isCorrect) {
          lines.push({ type: 'success', text: `✔ ${command.toUpperCase()} ${arg} — בוצע בהצלחה` });
          lines.push({ type: 'success', text: `  ► כתובת IP ${arg} נחסמה בחומת האש` });

          const matchedCmd = scenario.solution.commands.find(c =>
            c.toLowerCase().includes(command) && c.toLowerCase().includes(arg)
          );
          if (matchedCmd) {
            setCompletedSteps(prev => {
              if (prev.includes(matchedCmd)) return prev;
              const next = [...prev, matchedCmd];
              const stepIdx = Math.min(next.length - 1, scenario.playbook.length - 1);
              lines.push({ type: 'success', text: `  ► שלב ${stepIdx + 1} הושלם: ${scenario.playbook[stepIdx]?.title}` });
              return next;
            });
          }
        } else {
          lines.push({ type: 'error', text: `✘ ${command.toUpperCase()} ${arg} — כתובת IP שגויה` });
          lines.push({ type: 'error', text: '  ► בדוק את הלוגים שוב ומצא את כתובת התוקף' });
          setScore(s => Math.max(0, s - 15));
          setMistakes(m => m + 1);
        }
      }

    } else if (command === 'close-ticket') {
      // Read current state via functional updaters to avoid stale closures
      setCompletedSteps(currentSteps => {
        setScore(currentScore => {
          setMistakes(currentMistakes => {
            const allDone = scenario.solution.commands.every(c =>
              currentSteps.some(cs => cs.includes(c.split(' ')[0]))
            );

            if (allDone || currentSteps.length > 0) {
              const finalScore = Math.max(0, currentScore - currentMistakes * 5);
              lines.push({ type: 'success', text: '✔ הכרטיס נסגר. מעביר לדו"ח...' });
              lines.push({ type: 'success', text: `  ► ניקוד סופי: ${finalScore}` });

              // Publish final state — the page will react via useEffect
              setFinalState({ score: finalScore, mistakes: currentMistakes, commands: currentSteps });
              setFinished(true);
            } else {
              lines.push({ type: 'error', text: '✘ לא ניתן לסגור — טרם בוצעו פעולות בלימה.' });
              lines.push({ type: 'error', text: '  ► בצע את הפעולות הנדרשות ואז נסה שוב.' });
              setScore(s => Math.max(0, s - 10));
            }
            push(lines);
            return currentMistakes;
          });
          return currentScore;
        });
        return currentSteps;
      });
      return; // push already called inside

    } else {
      lines.push({ type: 'error', text: `פקודה לא מוכרת: "${command}". הקלד "help" לרשימת פקודות.` });
      setScore(s => Math.max(0, s - 5));
      setMistakes(m => m + 1);
    }

    push(lines);
  }, [scenario]);

  const currentScore = Math.max(0, score - mistakes * 5);

  return {
    history,
    input,
    setInput,
    handleCommand,
    completedSteps,
    score: currentScore,
    mistakes,
    finished,
    finalState, // { score, mistakes, commands } once finished, else null
  };
}
