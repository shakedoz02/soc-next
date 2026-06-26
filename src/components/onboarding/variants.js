// Shared Framer Motion variants for the onboarding flow.
// All durations in seconds, all numeric easing curves match the app's existing style.

export const EASE = [0.22, 1, 0.36, 1];

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Full-screen dimmer backdrop
export const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// Directional modal panel — custom prop `dir` passed as AnimatePresence custom
export const modalVariants = {
  hidden:  (dir) => ({ opacity: 0, x: dir > 0 ? 36 : -36, scale: 0.97 }),
  visible: { opacity: 1, x: 0, scale: 1, transition: { ease: EASE, duration: 0.32 } },
  exit:    (dir) => ({
    opacity: 0,
    x: dir > 0 ? -36 : 36,
    scale: 0.97,
    transition: { ease: EASE, duration: 0.22 },
  }),
};

// Reduced-motion fallback: fade only
export const reducedModalVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.12 } },
};

// Parent container for staggered children
export const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// Card / list item child
export const cardVariants = {
  hidden:  { opacity: 0, y: 14, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { ease: EASE, duration: 0.3 } },
};

// Tooltip slide-in from right (RTL)
export const tooltipVariants = {
  hidden:  { opacity: 0, x: 12, scale: 0.96 },
  visible: { opacity: 1, x: 0,  scale: 1,    transition: { ease: EASE, duration: 0.28 } },
  exit:    { opacity: 0, x: -12, scale: 0.96, transition: { ease: EASE, duration: 0.18 } },
};

// Micro-interaction props for interactive elements
export const tapProps = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.98 },
  transition: { type: 'spring', stiffness: 420, damping: 20 },
};
