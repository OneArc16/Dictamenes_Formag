import clsx from 'clsx';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function AuthCard({ title, subtitle, children, className }: AuthCardProps) {
  return (
    <div className={clsx(
      "overflow-hidden rounded-2xl border border-subtle bg-panel shadow-lg", 
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 text-white border-b border-subtle bg-gradient-to-r from-brand-400 to-brand-600">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
            <path d="M12 3l9 6-9 6-9-6 9-6Z" strokeWidth="2" />
          </svg>
        </span>
        <div>
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="text-xs/5 text-white/80">{subtitle}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}
