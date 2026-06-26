import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { CHECKLIST_ITEMS } from '../config';
import { tapProps, EASE, prefersReducedMotion } from '../variants';

export default function ChecklistWidget() {
  const { showChecklist, checklist, checklistCompleted, checklistTotal } = useOnboarding();
  const [open, setOpen] = useState(true);
  const reduced         = prefersReducedMotion();
  const percent         = Math.round((checklistCompleted / checklistTotal) * 100);

  return (
    <AnimatePresence>
      {showChecklist && (
        <motion.div
          key="checklist-widget"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0,  scale: 1    }}
          exit={reduced    ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          transition={{ ease: EASE, duration: 0.3 }}
          className="fixed bottom-6 left-6 z-40 w-64 bg-[#1C2536] border border-[#222f45] rounded-xl shadow-2xl overflow-hidden"
          role="complementary"
          aria-label="צ'קליסט הכניסה"
        >
          {/* Header — always visible */}
          <button
            onClick={() => setOpen((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#222f45]/40 transition-colors group"
            aria-expanded={open}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9FEF00] text-base">
                {checklistCompleted === checklistTotal ? 'check_circle' : 'checklist'}
              </span>
              <span className="text-white text-xs font-bold">התחלה מהירה</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9FEF00] text-[10px] font-mono">
                {checklistCompleted}/{checklistTotal}
              </span>
              <span
                className={`material-symbols-outlined text-slate-500 text-base transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </div>
          </button>

          {/* Progress bar */}
          <div className="px-4 pb-2">
            <div className="w-full h-1 bg-[#111927] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#9FEF00] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${percent}%` }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 80, damping: 18 }
                }
              />
            </div>
          </div>

          {/* Checklist items */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                key="checklist-items"
                initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                exit={reduced    ? { opacity: 0 } : { height: 0,      opacity: 0 }}
                transition={{ ease: EASE, duration: 0.22 }}
                className="overflow-hidden"
                role="list"
              >
                <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
                  {CHECKLIST_ITEMS.map((item) => {
                    const done = checklist[item.id];
                    return (
                      <motion.li
                        key={item.id}
                        layout
                        role="listitem"
                        className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors ${
                          done ? 'bg-[#9FEF00]/5' : 'bg-[#111927]'
                        }`}
                      >
                        {/* Check icon */}
                        <motion.span
                          className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${
                            done ? 'text-[#9FEF00]' : 'text-slate-600'
                          }`}
                          animate={
                            done && !reduced
                              ? { scale: [1, 1.3, 1] }
                              : {}
                          }
                          transition={{ duration: 0.3 }}
                        >
                          {done ? 'check_circle' : 'radio_button_unchecked'}
                        </motion.span>

                        {/* Text */}
                        <div className="text-right min-w-0">
                          <p
                            className={`text-xs font-semibold leading-tight ${
                              done ? 'text-slate-500 line-through' : 'text-slate-300'
                            }`}
                          >
                            {item.label}
                          </p>
                          {!done && (
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </div>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
