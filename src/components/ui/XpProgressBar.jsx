import { motion } from 'framer-motion';

export default function XpProgressBar({ xp, xpToNext, percent: propPercent, isHovered = false, labelClassName = 'mt-2 text-xs text-slate-500 font-mono' }) {
  const percent = propPercent ?? Math.round(((xp || 0) / (xpToNext || 1)) * 100);
  const remaining = xpToNext != null && xp != null ? (xpToNext - xp).toLocaleString() : null;

  return (
    <>
      <div className="relative">
        <div
          className="w-full h-2 bg-[#111927] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full bg-[#9FEF00] rounded-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '250%' }}
                transition={{ duration: 0.75, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
              />
            )}
          </motion.div>
        </div>

        {remaining != null && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111927] border border-[#9FEF00]/30 text-[#9FEF00] text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none whitespace-nowrap"
          >
            {remaining} XP עד הרמה הבאה
          </motion.span>
        )}
      </div>

      {xp != null && xpToNext != null && (
        <div className={`flex justify-between ${labelClassName}`}>
          <span>{xp?.toLocaleString()} XP</span>
          <span>{xpToNext?.toLocaleString()} XP</span>
        </div>
      )}
    </>
  );
}
