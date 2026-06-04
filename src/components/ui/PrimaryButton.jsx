import { Link } from 'react-router-dom';

export default function PrimaryButton({ to, href, children, className = '', ...props }) {
  const baseClass = `bg-[#9FEF00] text-[#111927] font-bold rounded hover:brightness-110 active:scale-95 transition-all ${className}`;
  if (to) {
    return <Link to={to} className={baseClass} {...props}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={baseClass} {...props}>{children}</a>;
  }
  return <button className={baseClass} {...props}>{children}</button>;
}
