'use client';

import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function LoadingButton({ loading, children, disabled, ...props }: Props) {
  const isDisabled = loading || disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-slate-900 transition
        ${isDisabled ? 'cursor-not-allowed opacity-90' : 'hover:scale-[1.01]'}
      `}
    >
      {/* Glow/gradiente de fondo */}
      <span className="absolute inset-0 transition-all -z-10 rounded-xl bg-gradient-to-tr from-sky-400 via-cyan-300 to-indigo-400" />
      <span className="absolute inset-0 -z-20 rounded-xl bg-white/10" />
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeOpacity="0.25" strokeWidth="4" />
          <path d="M21 12a9 9 0 0 1-9 9" strokeWidth="4" />
        </svg>
      )}
      <span className="relative">{loading ? 'Ingresando…' : children}</span>
    </button>
  );
}
