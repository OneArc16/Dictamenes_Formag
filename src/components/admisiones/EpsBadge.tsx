'use client';

export default function EpsBadge({ value, isFidu }: { value?: string; isFidu: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        isFidu
          ? 'border border-brand-300 bg-brand-50 text-brand-700'
          : 'border border-subtle bg-bg text-muted'
      }`}
    >
      {value || '—'}
    </span>
  );
}
