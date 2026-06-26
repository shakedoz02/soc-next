import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../variants';

const COLORS = ['#9FEF00', '#F59E0B', '#60A5FA', '#F472B6', '#34D399', '#A78BFA'];

export default function ConfettiCanvas() {
  const reduced = prefersReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: reduced ? 0 : 45 }, (_, i) => ({
        id:        i,
        x:         Math.random() * 100,         // vw %
        delay:     Math.random() * 0.7,
        duration:  1.6 + Math.random() * 1.4,
        color:     COLORS[Math.floor(Math.random() * COLORS.length)],
        width:     6  + Math.random() * 7,
        height:    3  + Math.random() * 4,
        rotation:  (Math.random() - 0.5) * 720, // total spin degrees
        xDrift:    (Math.random() - 0.5) * 120, // px horizontal drift while falling
      })),
    [reduced],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[90]" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `calc(${p.x}vw + 0px)`, opacity: 1, rotate: 0 }}
          animate={{
            y:       '110vh',
            x:       `calc(${p.x}vw + ${p.xDrift}px)`,
            opacity: [1, 1, 0.6, 0],
            rotate:  p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay:    p.delay,
            ease:     'linear',
          }}
          className="absolute top-0 rounded-sm"
          style={{
            width:           p.width,
            height:          p.height,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
