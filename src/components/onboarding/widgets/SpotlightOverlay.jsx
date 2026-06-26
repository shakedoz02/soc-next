import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tooltipVariants, tapProps, prefersReducedMotion } from '../variants';

const PADDING = 10; // px around the highlighted element

function useElementRect(tourId) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tour-id="${tourId}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({
      left:   r.left   - PADDING,
      top:    r.top    - PADDING,
      width:  r.width  + PADDING * 2,
      height: r.height + PADDING * 2,
    });
  }, [tourId]);

  useEffect(() => {
    // Small delay so the DOM is painted after navigation
    const t = setTimeout(measure, 80);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  return rect;
}

function getTooltipPosition(rect, placement) {
  if (!rect) return {};
  const GAP = 14;
  switch (placement) {
    case 'bottom':
      return { top: rect.top + rect.height + GAP, left: rect.left, minWidth: rect.width };
    case 'top':
      return { bottom: window.innerHeight - rect.top + GAP, left: rect.left, minWidth: rect.width };
    case 'left':
      return { top: rect.top, right: window.innerWidth - rect.left + GAP };
    case 'right':
      return { top: rect.top, left: rect.left + rect.width + GAP };
    default:
      return { top: rect.top + rect.height + GAP, left: rect.left };
  }
}

export default function SpotlightOverlay({
  tourId,
  placement,
  title,
  description,
  step,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}) {
  const rect    = useElementRect(tourId);
  const reduced = prefersReducedMotion();

  if (!rect) return null;

  const tooltipStyle = getTooltipPosition(rect, placement);

  return (
    <>
      {/* ── Click-blocking transparent overlay (below spotlight) ── */}
      <div
        className="fixed inset-0 z-[49]"
        aria-hidden="true"
        onClick={onNext}
      />

      {/* ── Spotlight ring + shadow that dims everything around it ── */}
      <motion.div
        layoutId="spotlight-ring"
        className="fixed z-[50] rounded-lg pointer-events-none"
        style={{
          left:   rect.left,
          top:    rect.top,
          width:  rect.width,
          height: rect.height,
          boxShadow: [
            '0 0 0 9999px rgba(7, 15, 28, 0.82)',
            '0 0 0 2px #9FEF00',
            '0 0 24px rgba(159, 239, 0, 0.35)',
          ].join(', '),
        }}
        transition={
          reduced
            ? { duration: 0.12 }
            : { type: 'spring', stiffness: 260, damping: 28 }
        }
      />

      {/* ── Tooltip card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tourId}
          variants={reduced ? undefined : tooltipVariants}
          initial={reduced ? { opacity: 0 } : 'hidden'}
          animate={reduced ? { opacity: 1 } : 'visible'}
          exit={reduced ? { opacity: 0 } : 'exit'}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-tooltip-title"
          className="fixed z-[60] w-72 bg-[#1C2536] border border-[#9FEF00]/30 rounded-xl shadow-2xl p-5 text-right"
          style={tooltipStyle}
        >
          {/* Step dots */}
          <div className="flex items-center justify-end gap-1.5 mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-5 bg-[#9FEF00]'
                    : i < step
                      ? 'w-1.5 bg-[#9FEF00]/50'
                      : 'w-1.5 bg-[#222f45]'
                }`}
              />
            ))}
          </div>

          <h3 id="tour-tooltip-title" className="text-white font-bold text-sm mb-1">
            {title}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-5">{description}</p>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              {...tapProps}
              onClick={onNext}
              className="flex-1 bg-[#9FEF00] text-[#111927] font-bold rounded-lg py-2 text-xs uppercase tracking-wide hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FEF00]"
            >
              {step < totalSteps - 1 ? 'הבא' : 'סיום הסיור'}
            </motion.button>

            {step > 0 && (
              <motion.button
                {...tapProps}
                onClick={onBack}
                className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs border border-[#222f45] rounded-lg transition-colors"
              >
                חזור
              </motion.button>
            )}

            <button
              onClick={onSkip}
              className="text-slate-600 hover:text-slate-400 text-[10px] px-1 transition-colors"
            >
              דלג
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
