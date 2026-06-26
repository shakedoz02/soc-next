import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { ROLE_OPTIONS, GOAL_OPTIONS } from '../config';
import {
  backdropVariants,
  modalVariants,
  reducedModalVariants,
  containerVariants,
  cardVariants,
  tapProps,
  prefersReducedMotion,
} from '../variants';

function OptionCard({ icon, label, selected, onClick }) {
  return (
    <motion.button
      variants={cardVariants}
      {...tapProps}
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FEF00]',
        selected
          ? 'bg-[#9FEF00]/10 border-[#9FEF00]/60 text-[#9FEF00]'
          : 'bg-[#111927] border-[#222f45] text-slate-400 hover:border-[#9FEF00]/30 hover:text-slate-200',
      ].join(' ')}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </motion.button>
  );
}

export default function PersonalizationStep() {
  const {
    phase,
    direction,
    personalization,
    advance,
    back,
    skip,
    setPersonalization,
  } = useOnboarding();

  const reduced       = prefersReducedMotion();
  const panelVariants = reduced ? reducedModalVariants : modalVariants;

  const [role, setRole] = useState(personalization.role);
  const [goal, setGoal] = useState(personalization.goal);

  function handleNext() {
    setPersonalization({ role, goal });
    advance();
  }

  return createPortal(
    <AnimatePresence>
      {phase === 'personalization' && (
        <>
          <motion.div
            key="pers-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-[#070f1c]/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            key="pers-panel"
            custom={direction}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pers-title"
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg bg-[#1C2536] border border-[#222f45] rounded-xl shadow-2xl p-8 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-end gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === 0 ? 'w-6 bg-[#9FEF00]' : 'w-2 bg-[#222f45]'
                    }`}
                  />
                ))}
              </div>

              <h2 id="pers-title" className="text-xl font-black text-white mb-1">
                ספר לנו קצת עליך
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                זה עוזר לנו להתאים את החוויה עבורך
              </p>

              {/* Role */}
              <p className="text-slate-300 text-sm font-semibold mb-3">מה התפקיד שלך?</p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-4 gap-2 mb-6"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    {...opt}
                    selected={role === opt.id}
                    onClick={() => setRole(opt.id)}
                  />
                ))}
              </motion.div>

              {/* Goal */}
              <p className="text-slate-300 text-sm font-semibold mb-3">מה המטרה שלך?</p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-4 gap-2 mb-8"
              >
                {GOAL_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    {...opt}
                    selected={goal === opt.id}
                    onClick={() => setGoal(opt.id)}
                  />
                ))}
              </motion.div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <motion.button
                  {...tapProps}
                  onClick={handleNext}
                  className="flex-1 bg-[#9FEF00] text-[#111927] font-bold rounded-lg py-3 text-sm uppercase tracking-wide hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FEF00]"
                >
                  הבא
                  <span className="material-symbols-outlined align-middle text-base mr-2">
                    arrow_back
                  </span>
                </motion.button>

                <motion.button
                  {...tapProps}
                  onClick={back}
                  className="px-4 py-3 text-slate-400 hover:text-slate-200 text-sm border border-[#222f45] rounded-lg transition-colors"
                >
                  חזור
                </motion.button>

                <button
                  onClick={skip}
                  className="text-slate-600 hover:text-slate-400 text-xs px-2 transition-colors"
                >
                  דלג
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
