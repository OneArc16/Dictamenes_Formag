import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const inputClassName =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function TextInput({ className, ...props }: TextInputProps) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export function SelectInput({
  className,
  options,
  placeholder = 'Seleccione...',
  ...props
}: SelectInputProps) {
  return (
    <select className={cn(inputClassName, className)} {...props}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type FormSectionProps = {
  title: string;
  children: ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </header>
      <div className="space-y-4 bg-white p-4">{children}</div>
    </section>
  );
}
