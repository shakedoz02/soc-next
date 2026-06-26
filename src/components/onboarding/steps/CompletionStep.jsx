import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ConfettiCanvas from '../widgets/ConfettiCanvas';
import {
  backdropVariants,
  containerVariants,
  cardVariants,
  tapProps,
  prefersReducedMotion,
  EASE,
} from '../variants';

export default function CompletionStep() {
  const { user }                    = useAuth();
  const { phase, closeCompletion }  = useOnboarding();
  const reduced                     = prefersReducedMotion();
  const firstName                   = user?.name?.split(' ')[0] ?? 'אנליסט';

  return createPortal(
    <AnimatePresence>
      {phase === 'complete' && (
        <>
          {/* Confetti */}
          <ConfettiCanvas />

          {/* Backdrop */}
          <motion.div
            key="completion-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[70] bg-[#070f1c]/85 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="completion-panel"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 24 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1,    y: 0 }}
            exit={reduced   ? { opacity: 0 } : { opacity: 0, scale: 0.9,  y: 16 }}
            transition={{ ease: EASE, duration: 0.38 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-title"
            className="fixed z-[80] inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm bg-[#1C2536] border border-[#9FEF00]/30 rounded-xl shadow-2xl p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success icon with ring pulse */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#9FEF00]/30"
                  animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeOut' }}
                />
                <div className="w-full h-full rounded-full bg-[#9FEF00]/10 border border-[#9FEF00]/40 flex items-center justify-center">
                  <motion.span
                    className="material-symbols-outlined text-[#9FEF00] text-4xl"
                    initial={reduced ? {} : { scale: 0.5, opacity: 0 }}
                    animate={reduced ? {} : { scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, ease: EASE, duration: 0.35 }}
                  >
                    verified
                  </motion.span>
                </div>
              </div>

              <h2
                id="completion-title"
                className="text-2xl font-black text-white mb-2 neon-glow"
              >
                כל הכבוד, {firstName}!
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                השלמת את כל משימות ההתחלה. הפרופיל שלך עודכן — ועכשיו הלאב מחכה לך.
              </p>

              {/* Achievement badges */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-3 mb-8"
              >
                {[
                  { icon: 'play_arrow',     label: 'חקירה ראשונה' },
                  { icon: 'task_alt',       label: 'חקירה הושלמה' },
                  { icon: 'account_circle', label: 'פרופיל נצפה'  },
                ].map(({ icon, label }) => (
                  <motion.div
                    key={label}
                    variants={cardVariants}
                    className="bg-[#111927] border border-[#9FEF00]/20 rounded-lg p-3 text-center"
                  >
                    <span className="material-symbols-outlined text-[#9FEF00] text-xl block mb-1">
                      {icon}
                    </span>
                    <span className="text-slate-400 text-[10px]">{label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                {...tapProps}
                onClick={closeCompletion}
                className="w-full bg-[#9FEF00] text-[#111927] font-bold rounded-lg py-3 text-sm uppercase tracking-wide hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FEF00]"
              >
                <span className="material-symbols-outlined align-middle text-base ml-2">
                  rocket_launch
                </span>
                כנס ללאב
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
