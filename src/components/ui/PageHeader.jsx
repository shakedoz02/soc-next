export default function PageHeader({ eyebrow, title, description, className = 'mb-10' }) {
  return (
    <div className={className}>
      <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">{eyebrow}</div>
      <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
