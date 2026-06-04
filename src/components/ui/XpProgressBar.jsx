export default function XpProgressBar({ xp, xpToNext, percent: propPercent, labelClassName = 'mt-2 text-xs text-slate-500 font-mono' }) {
  const percent = propPercent ?? Math.round(((xp || 0) / (xpToNext || 1)) * 100);
  return (
    <>
      <div
        className="w-full h-2 bg-[#111927] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#9FEF00] rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
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
