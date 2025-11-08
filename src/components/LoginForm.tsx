'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type LoginFormProps = {
  action?: string;            // endpoint (default /api/auth/login)
  onSuccessRedirect?: string; // fallback si el API no envía redirect
};

export default function LoginForm({
  action = '/api/auth/login',
  onSuccessRedirect = '/',
}: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim() || loading) return;

    setLoading(true);
    const t = toast.loading('Ingresando…');
    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Usuario o contraseña inválidos');
      }
      toast.success('Bienvenido', { id: t });
      router.replace(data.redirect ?? onSuccessRedirect);
    } catch (err: any) {
      toast.error(err?.message || 'Error de autenticación', { id: t });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label="Documento" hint="Número de identificación">
        <input
          id="username"
          inputMode="numeric"
          autoComplete="username"
          disabled={loading}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ej: 1082…"
          className="w-full px-4 py-3 border rounded-xl border-subtle bg-bg text-text placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
        />
      </Field>

      <Field label="Clave" hint="Asignada en el sistema">
        <div className="relative">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 border rounded-xl border-subtle bg-bg text-text placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 inline-flex items-center justify-center px-3 my-auto text-sm border rounded-lg right-2 h-9 border-subtle bg-panel text-muted hover:bg-bg"
            tabIndex={-1}
          >
            {show ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={loading || !username.trim() || !password.trim()}
        className="inline-flex items-center justify-center px-4 mt-2 text-sm font-medium text-white border h-11 rounded-xl border-subtle bg-primary hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Validando…
          </span>
        ) : (
          'Ingresar'
        )}
      </button>
    </form>
  );
}

/* ---------- helpers UI locales ---------- */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-text">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
