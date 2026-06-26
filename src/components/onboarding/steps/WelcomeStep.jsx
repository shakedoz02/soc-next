import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import {
  backdropVariants,
  modalVariants,
  reducedModalVariants,
  tapProps,
  prefersReducedMotion,
} from '../variants';

export default function WelcomeStep() {
  const { user }              = useAuth();
  const { phase, direction, advance, skip } = useOnboarding();
  const reduced               = prefersReducedMotion();
  const panelVariants         = reduced ? reducedModalVariants : modalVariants;
  const firstName             = user?.name?.split(' ')[0] ?? 'אנליסט';

  return createPortal(
    <AnimatePresence>
      {phase === 'welcome' && (
        <>
          {/* Backdrop */}
          <motion.div
            key="welcome-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-[#070f1c]/80 backdrop-blur-sm"
            onClick={skip}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="welcome-panel"
            custom={direction}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-full max-w-md bg-[#1C2536] border border-[#222f45] rounded-xl shadow-2xl p-8 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative neon corner */}
              <div
                className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-full h-full rounded-tr-xl border-t-2 border-r-2 border-[#9FEF00]/30" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#9FEF00]/10 border border-[#9FEF00]/20 rounded-full px-3 py-1 mb-6">
                <span className="material-symbols-outlined text-[#9FEF00] text-base">shield</span>
                <span className="text-[#9FEF00] text-xs font-mono uppercase tracking-widest">
                  SOC Analyst Training
                </span>
              </div>

              {/* Heading */}
              <h1
                id="welcome-title"
                className="text-2xl font-black text-white mb-2 leading-tight neon-glow"
              >
                ברוך הבא, {firstName}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                אתה עומד להתחיל את אימון אבטחת הסייבר שלך.
                התאמן על תרחישי תקיפה אמיתיים, צבור XP, ועלה בדרגות.
              </p>

              {/* Stats teaser */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: 'security',        label: 'תרחישי תקיפה' },
                  { icon: 'terminal',        label: 'לאב אינטראקטיבי' },
                  { icon: 'emoji_events',    label: 'מערכת דרגות' },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="bg-[#111927] border border-[#222f45] rounded-lg p-3 text-center"
                  >
                    <span className="material-symbols-outlined text-[#9FEF00] text-xl block mb-1">
                      {icon}
                    </span>
                    <span className="text-slate-400 text-[10px]">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <motion.button
                  {...tapProps}
                  onClick={advance}
                  className="w-full bg-[#9FEF00] text-[#111927] font-bold rounded-lg py-3 text-sm uppercase tracking-wide hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FEF00]"
                >
                  בוא נתחיל
                  <span className="material-symbols-outlined align-middle text-base mr-2">
                    arrow_back
                  </span>
                </motion.button>

                <button
                  onClick={skip}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs py-2 transition-colors"
                >
                  דלג על ההדרכה
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
