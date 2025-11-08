'use client';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

export function FormText({ name, label, type='text', placeholder }:{
  name: string; label: string; type?: string; placeholder?: string;
}) {
  const { register, formState: { errors } } = useFormContext();
  const err = (errors as any)[name]?.message as string | undefined;

  return (
    <label className="grid gap-1">
      <span className="text-sm text-slate-600">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          'rounded-md border px-3 py-2 outline-none focus:ring',
          err ? 'border-red-500' : 'border-slate-300'
        )}
      />
      {err && <span className="text-xs text-red-600">{err}</span>}
    </label>
  );
}
