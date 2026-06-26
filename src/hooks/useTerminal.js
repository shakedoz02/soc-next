import { useState, useCallback } from 'react';

const HELP_LINES = [
  'פקודות זמינות:',
  '  fw-block <IP>           — חסימת כתובת IP בחומת האש',
  '  isolate-host <IP>       — בידוד מארח מהרשת',
  '  kill-session <IP>       — ביטול סשן פעיל',
  '  whois <IP>              — מידע על כתובת IP',
  '  scan <IP>               — סריקת פורטים פתוחים',
  '  port-info               — הסבר על הפורטים שנמצאו בסריקה',
  '  reset-password <user>   — איפוס סיסמה למשתמש',
  '  disable-account <user>  — השבתת חשבון משתמש',
  '  block-url <URL>         — חסימת כתובת URL',
  '  quarantine <file>       — בידוד קובץ חשוד',
  '  close-ticket            — סגירת הכרטיס וסיום החקירה',
  '  help                    — הצגת עזרה',
];

const BLOCK_COMMANDS = ['fw-block', 'isolate-host', 'kill-session'];

const SCAN_PORTS = {
  'sql-injection': [
    '  80/tcp   open  http',
    '  443/tcp  open  https',
    '  3306/tcp open  mysql',
  ],
  'brute-force': [
    '  22/tcp   open  ssh',
    '  3389/tcp open  rdp',
    '  443/tcp  open  https',
  ],
  'ransomware': [
    '  22/tcp   open  ssh',
    '  4444/tcp open  c2-beacon',
    '  8080/tcp open  http-proxy',
  ],
  'port-scan': [
    '  22/tcp   open  ssh',
    '  80/tcp   open  http',
    '  443/tcp  open  https',
    '  3306/tcp open  mysql',
    '  8080/tcp open  http-alt',
    '  3389/tcp open  rdp',
  ],
  'phishing': [
    '  25/tcp   open  smtp',
    '  80/tcp   open  http',
    '  443/tcp  open  https',
  ],
  'ddos': [
    '  80/tcp   open  http',
    '  443/tcp  open  https',
    '  53/tcp   open  dns',
  ],
  'privilege-escalation': [
    '  22/tcp   open  ssh',
    '  4444/tcp open  c2-beacon',
    '  9999/tcp open  backdoor',
  ],
  'data-exfiltration': [
    '  443/tcp  open  https',
    '  3306/tcp open  mysql',
    '  5432/tcp open  postgresql',
    '  22/tcp   open  ssh',
  ],
  default: [
    '  22/tcp   open  ssh',
    '  80/tcp   open  http',
    '  443/tcp  open  https',
  ],
};

const PORT_INFO = {
  'sql-injection': [
    '  80/tcp  — HTTP: שרת Web. ערוץ התקיפה הראשי — דרכו נשלחו בקשות SQL זדוניות.',
    '  443/tcp — HTTPS: תעבורה מוצפנת. יכול להסתיר payload של הזרקת SQL.',
    '  3306/tcp — MySQL: שרת מסד נתונים. רלוונטי כי התוקף ניסה לגנוב נתונים ישירות ממסד הנתונים.',
  ],
  'brute-force': [
    '  22/tcp  — SSH: גישה מרוחקת מוצפנת. יעד נפוץ למתקפות כוח גס.',
    '  3389/tcp — RDP: שולחן עבודה מרוחק של Windows. חשוף למתקפות כוח גס ולגישה לא מורשית.',
    '  443/tcp — HTTPS: שימש לגישה לפורטל האימות שהותקף.',
  ],
  'ransomware': [
    '  22/tcp  — SSH: שימש לתנועה לרוחב ברשת לאחר הפריצה הראשונית.',
    '  4444/tcp — C2 Beacon: פורט קלאסי לתקשורת Command & Control. מעיד על נוכחות נוזקה פעילה.',
    '  8080/tcp — HTTP Proxy: שימש להעברת תעבורת C2 כדי לעקוף חסימות חומת אש.',
  ],
  'port-scan': [
    '  22/tcp  — SSH: גישה מרוחקת. זוהה בסריקה כפורט פתוח ברשת.',
    '  80/tcp  — HTTP: שרת Web לא מוצפן. נסרק לאיתור פגיעויות ידועות.',
    '  443/tcp — HTTPS: שרת Web מוצפן. נכלל בסריקת הפגיעויות.',
    '  3306/tcp — MySQL: מסד נתונים חשוף לרשת — ממצא קריטי בסריקה.',
    '  8080/tcp — HTTP Alt: פורט Web חלופי. לעיתים משמש לממשקי ניהול.',
    '  3389/tcp — RDP: גישה מרוחקת ל-Windows. ממצא בסיכון גבוה בסריקה.',
  ],
  'phishing': [
    '  25/tcp  — SMTP: שרת דואר. שימש לשליחת מיילי פישינג מתוך הרשת.',
    '  80/tcp  — HTTP: אתר פישינג מזויף הושת על שרת זה.',
    '  443/tcp — HTTPS: גרסה מוצפנת של אתר הפישינג להגברת אמינות.',
  ],
  'ddos': [
    '  80/tcp  — HTTP: היעד העיקרי של ה-DDoS — הוצף בבקשות.',
    '  443/tcp — HTTPS: שכבת HTTPS גם היא הוצפה במסגרת המתקפה.',
    '  53/tcp  — DNS: פורט DNS על TCP — מעיד על ניסיון להציף שאילתות DNS.',
  ],
  'privilege-escalation': [
    '  22/tcp  — SSH: שימש לגישה ראשונית שדרכה בוצעה הסלמת ההרשאות.',
    '  4444/tcp — C2 Beacon: פורט תקשורת לשרת שליטה — הנוזקה מחכה לפקודות.',
    '  9999/tcp — Backdoor: דלת אחורית שהותקנה לאחר הסלמת ההרשאות לשמירת גישה.',
  ],
  'data-exfiltration': [
    '  443/tcp — HTTPS: ערוץ ההדלפה הראשי — נתונים הוצאו מוצפנים דרך HTTPS.',
    '  3306/tcp — MySQL: מסד הנתונים ממנו הוצאו הנתונים.',
    '  5432/tcp — PostgreSQL: מסד נתונים נוסף שנפרץ לצורך חילוץ מידע.',
    '  22/tcp  — SSH: שימש להעברת קבצים גנובים באמצעות SCP/SFTP.',
  ],
  default: [
    '  22/tcp  — SSH: פרוטוקול גישה מרוחקת מוצפן.',
    '  80/tcp  — HTTP: תעבורת Web לא מוצפנת.',
    '  443/tcp — HTTPS: תעבורת Web מוצפנת.',
  ],
};

const INITIAL_FINAL = null;

export function useTerminal(scenario) {
  const [history, setHistory] = useState([
    { type: 'system', text: `SOC-Next Terminal v2.4 — Scenario: ${scenario?.title ?? 'Unknown'}` },
    { type: 'system', text: 'Type "help" for available commands. Good luck, analyst.' },
    { type: 'prompt', text: '' },
  ]);
  const [input, setInput]               = useState('');
  const [score, setScore]               = useState(100);
  const [mistakes, setMistakes]         = useState(0);
  const [scanRun, setScanRun]           = useState(false);
  // Stores 0-based playbook step indices that have been completed
  const [completedSteps, setCompletedSteps] = useState([]);
  // Stores the actual command strings executed (for finalState / PDF export)
  const [executedCmds, setExecutedCmds] = useState([]);
  const [finished, setFinished]         = useState(false);
  const [finalState, setFinalState]     = useState(INITIAL_FINAL);

  const push = (lines) =>
    setHistory(h => [...h.slice(0, -1), ...lines, { type: 'prompt', text: '' }]);

  // Checks solution.commands for a matching entry and, if found, appends a step
  // completion message to lines and updates completedSteps / executedCmds state.
  const tryCompleteStep = (command, arg, lines) => {
    const entry = scenario?.solution?.commands?.find(e =>
      e.cmd.toLowerCase().startsWith(command) && e.cmd.toLowerCase().includes(arg)
    );
    if (!entry) return;
    lines.push({
      type: 'success',
      text: `  ► שלב ${entry.stepIndex + 1} הושלם: ${scenario?.playbook?.[entry.stepIndex]?.title}`,
    });
    setCompletedSteps(prev => prev.includes(entry.stepIndex) ? prev : [...prev, entry.stepIndex]);
    setExecutedCmds(prev => prev.includes(entry.cmd) ? prev : [...prev, entry.cmd]);
  };

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
        tryCompleteStep(command, arg, lines);
      }

    } else if (command === 'scan') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש כתובת IP.' });
      } else {
        const scenarioId = scenario?.id;
        const NETWORK_SCENARIOS = ['ddos', 'port-scan', 'sql-injection', 'data-exfiltration'];

        if (NETWORK_SCENARIOS.includes(scenarioId)) {
          const ports = SCAN_PORTS[scenarioId] ?? SCAN_PORTS.default;
          lines.push({ type: 'output', text: `Scanning ${arg}...` });
          lines.push({ type: 'output', text: '  PORT      STATE  SERVICE' });
          ports.forEach(p => lines.push({ type: 'output', text: p }));
          lines.push({ type: 'output', text: '💡 הקלד port-info לקבלת הסבר על הפורטים שנמצאו' });
        } else if (scenarioId === 'phishing') {
          lines.push({ type: 'output', text: 'Scanning affected users...' });
          lines.push({ type: 'output', text: 'AFFECTED ACCOUNTS:' });
          lines.push({ type: 'output', text: '  user: david.cohen@company.com — clicked phishing link       → reset-password recommended' });
          lines.push({ type: 'output', text: '  user: sarah.levi@company.com  — credentials submitted       → reset-password recommended' });
          lines.push({ type: 'error',  text: '  user: admin@company.com       — session hijacked  ⚠         → disable-account IMMEDIATELY' });
          lines.push({ type: 'output', text: 'Total affected: 3 users' });
          lines.push({ type: 'output', text: '💡 הקלד port-info לקבלת מידע נוסף' });
        } else if (scenarioId === 'brute-force') {
          const resetCmd = scenario?.solution?.commands?.find(e => e.cmd.toLowerCase().startsWith('reset-password'));
          const compromisedUser = resetCmd ? resetCmd.cmd.split(' ')[1] : 'operator';
          lines.push({ type: 'output', text: 'Scanning target system...' });
          lines.push({ type: 'output', text: 'AUTHENTICATION LOGS:' });
          lines.push({ type: 'output', text: '  service: SSH (port 22) — 312 failed attempts' });
          lines.push({ type: 'output', text: '  service: RDP (port 3389) — 89 failed attempts' });
          lines.push({ type: 'output', text: `  compromised account: ${compromisedUser}`, values: [compromisedUser] });
          lines.push({ type: 'output', text: '  last successful login: from attacker IP' });
        } else if (scenarioId === 'privilege-escalation') {
          const disableCmd = scenario?.solution?.commands?.find(e => e.cmd.toLowerCase().startsWith('disable-account'));
          const escalatedUser = disableCmd ? disableCmd.cmd.split(' ')[1] : 'john.doe';
          lines.push({ type: 'output', text: 'Scanning compromised system...' });
          lines.push({ type: 'output', text: 'PRIVILEGE AUDIT:' });
          lines.push({ type: 'output', text: `  user: ${escalatedUser} — escalated to ROOT`, values: [escalatedUser] });
          lines.push({ type: 'output', text: '  modified files: /etc/shadow, /etc/passwd' });
          lines.push({ type: 'output', text: '  new hidden account: .sysadmin' });
          lines.push({ type: 'output', text: '  cron persistence: detected' });
        } else if (scenarioId === 'ransomware') {
          lines.push({ type: 'output', text: 'Scanning network for infections...' });
          lines.push({ type: 'output', text: 'INFECTED ENDPOINTS:' });
          lines.push({ type: 'output', text: '  Endpoint-07 — encrypted: 1,200 files' });
          lines.push({ type: 'output', text: '  Endpoint-12 — encryption in progress' });
          lines.push({ type: 'output', text: '  Endpoint-15 — beacon active' });
          lines.push({ type: 'output', text: '  C2 server: <attacker IP>' });
          lines.push({ type: 'output', text: '  Ransomware family: LockBit 3.0' });
          lines.push({ type: 'output', text: '  Malicious file detected: invoice_Q3.docm (macro-enabled)', values: ['invoice_Q3.docm'] });
        } else {
          const ports = SCAN_PORTS.default;
          lines.push({ type: 'output', text: `Scanning ${arg}...` });
          lines.push({ type: 'output', text: '  PORT      STATE  SERVICE' });
          ports.forEach(p => lines.push({ type: 'output', text: p }));
          lines.push({ type: 'output', text: '💡 הקלד port-info לקבלת הסבר על הפורטים שנמצאו' });
        }

        setScanRun(true);
        tryCompleteStep(command, arg, lines);
      }

    } else if (command === 'port-info') {
      if (!scanRun) {
        lines.push({ type: 'error', text: 'שגיאה: הרץ scan <IP> קודם' });
      } else {
        const LRE = '‪', RLE = '‫', PDF = '‬';
        const infos = PORT_INFO[scenario?.id] ?? PORT_INFO.default;
        infos.forEach(t => {
          const colonIdx = t.indexOf(': ');
          if (colonIdx !== -1) {
            const prefix = LRE + t.slice(0, colonIdx + 1) + PDF;
            const desc   = RLE + t.slice(colonIdx + 2) + PDF;
            lines.push({ type: 'output', text: prefix + ' ' + desc });
          } else {
            lines.push({ type: 'output', text: t });
          }
        });
      }

    } else if (BLOCK_COMMANDS.includes(command)) {
      if (!arg) {
        lines.push({ type: 'error', text: `שגיאה: נדרש כתובת IP. דוגמה: ${command} <IP>` });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        const isCorrect = scenario?.solution?.keywords?.some(k => arg.includes(k)) ?? false;
        if (isCorrect) {
          lines.push({ type: 'success', text: `✔ ${command.toUpperCase()} ${arg} — בוצע בהצלחה` });
          lines.push({ type: 'success', text: `  ► ‫כתובת ‪IP ${arg}‬ נחסמה בחומת האש‬` });

          tryCompleteStep(command, arg, lines);
        } else {
          const RLE = '\u202B';
          const LRE = '\u202A';
          const PDF = '\u202C';
          lines.push({
            type: 'error',
            text: `✘ ${command.toUpperCase()} ${arg} — ${RLE}כתובת ${LRE}IP${PDF} שגויה${PDF}`,
          });
          lines.push({ type: 'error', text: '  ► בדוק את הלוגים שוב ומצא את כתובת התוקף' });
          setScore(s => Math.max(0, s - 15));
          setMistakes(m => m + 1);
        }
      }

    } else if (command === 'close-ticket') {
      setCompletedSteps(currentSteps => {
        setScore(currentScore => {
          setMistakes(currentMistakes => {
            setExecutedCmds(currentCmds => {
              const allDone = scenario?.solution?.commands?.every(entry =>
                currentSteps.includes(entry.stepIndex)
              ) ?? false;

              if (allDone || currentSteps.length > 0) {
                const finalScore = currentScore;
                lines.push({ type: 'success', text: '✔ הכרטיס נסגר. מעביר לדו"ח...' });
                lines.push({ type: 'success', text: `  ► ניקוד סופי: ${finalScore}` });

                setFinalState({ score: finalScore, mistakes: currentMistakes, commands: currentCmds });
                setFinished(true);
              } else {
                lines.push({ type: 'error', text: '✘ לא ניתן לסגור — טרם בוצעו פעולות בלימה.' });
                lines.push({ type: 'error', text: '  ► בצע את הפעולות הנדרשות ואז נסה שוב.' });
                setScore(s => Math.max(0, s - 10));
              }
              push(lines);
              return currentCmds;
            });
            return currentMistakes;
          });
          return currentScore;
        });
        return currentSteps;
      });
      return; // push already called inside

    } else if (command === 'reset-password') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש שם משתמש. דוגמה: reset-password <user>' });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        const entry = scenario?.solution?.commands?.find(e =>
          e.cmd.toLowerCase() === `${command} ${arg.toLowerCase()}`
        );
        if (entry) {
          lines.push({ type: 'output', text: `Password reset successful for user: ${arg}. Temporary password sent to security team.` });
          lines.push({
            type: 'success',
            text: `  ► שלב ${entry.stepIndex + 1} הושלם: ${scenario?.playbook?.[entry.stepIndex]?.title}`,
          });
          setCompletedSteps(prev => prev.includes(entry.stepIndex) ? prev : [...prev, entry.stepIndex]);
          setExecutedCmds(prev => prev.includes(entry.cmd) ? prev : [...prev, entry.cmd]);
        } else {
          lines.push({ type: 'error', text: `✘ reset-password ${arg} — שם משתמש שגוי` });
          lines.push({ type: 'error', text: '  ► בדוק את הלוגים ומצא את החשבון שנפרץ' });
          setScore(s => Math.max(0, s - 15));
          setMistakes(m => m + 1);
        }
      }

    } else if (command === 'disable-account') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש שם משתמש. דוגמה: disable-account <user>' });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        const entry = scenario?.solution?.commands?.find(e =>
          e.cmd.toLowerCase() === `${command} ${arg.toLowerCase()}`
        );
        if (entry) {
          lines.push({ type: 'output', text: `Account ${arg} has been disabled. All active sessions terminated.` });
          lines.push({
            type: 'success',
            text: `  ► שלב ${entry.stepIndex + 1} הושלם: ${scenario?.playbook?.[entry.stepIndex]?.title}`,
          });
          setCompletedSteps(prev => prev.includes(entry.stepIndex) ? prev : [...prev, entry.stepIndex]);
          setExecutedCmds(prev => prev.includes(entry.cmd) ? prev : [...prev, entry.cmd]);
        } else {
          lines.push({ type: 'error', text: `✘ disable-account ${arg} — שם משתמש שגוי` });
          lines.push({ type: 'error', text: '  ► בדוק את הלוגים ומצא את החשבון שבוצעה בו ההסלמה' });
          setScore(s => Math.max(0, s - 15));
          setMistakes(m => m + 1);
        }
      }

    } else if (command === 'block-url') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש URL. דוגמה: block-url <URL>' });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        const isCorrect = scenario?.solution?.keywords?.some(k => arg.includes(k)) ?? false;
        if (isCorrect) {
          lines.push({ type: 'success', text: `✔ URL blocked successfully: ${arg}. Added to threat intelligence feed.` });
          // Try exact match first; fall back to matching by command name only
          const exactMatch = scenario?.solution?.commands?.find(e =>
            e.cmd.toLowerCase().startsWith(command) && e.cmd.toLowerCase().includes(arg)
          );
          const fallbackEntry = exactMatch ?? scenario?.solution?.commands?.find(e =>
            e.cmd.toLowerCase().startsWith(command)
          );
          if (fallbackEntry) {
            lines.push({
              type: 'success',
              text: `  ► שלב ${fallbackEntry.stepIndex + 1} הושלם: ${scenario?.playbook?.[fallbackEntry.stepIndex]?.title}`,
            });
            setCompletedSteps(prev => prev.includes(fallbackEntry.stepIndex) ? prev : [...prev, fallbackEntry.stepIndex]);
            setExecutedCmds(prev => prev.includes(fallbackEntry.cmd) ? prev : [...prev, fallbackEntry.cmd]);
          }
        } else {
          lines.push({ type: 'error', text: `✘ block-url ${arg} — URL שגוי` });
          lines.push({ type: 'error', text: '  ► בדוק את הלוגים ומצא את כתובת אתר הפישינג' });
          setScore(s => Math.max(0, s - 15));
          setMistakes(m => m + 1);
        }
      }

    } else if (command === 'quarantine') {
      if (!arg) {
        lines.push({ type: 'error', text: 'שגיאה: נדרש שם קובץ. דוגמה: quarantine <file>' });
        setScore(s => Math.max(0, s - 5));
        setMistakes(m => m + 1);
      } else {
        lines.push({ type: 'output', text: `File quarantined successfully: ${arg}. Moved to sandbox for analysis.` });
        tryCompleteStep(command, arg, lines);
      }

    } else {
      const RLE = '\u202B';
      const LRE = '\u202A';
      const PDF = '\u202C';
      lines.push({
        type: 'error',
        text: `${RLE}פקודה לא מוכרת: ${LRE}"${command}"${PDF}. הקלד ${LRE}"help"${PDF} לרשימת פקודות.${PDF}`,
      });
      setScore(s => Math.max(0, s - 5));
      setMistakes(m => m + 1);
    }

    push(lines);
  }, [scenario, scanRun]);

  const currentScore = score;

  return {
    history,
    input,
    setInput,
    handleCommand,
    completedSteps,  // number[] of completed playbook step indices
    score: currentScore,
    mistakes,
    finished,
    finalState,      // { score, mistakes, commands } once finished, else null
  };
}
