'use client';

import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!data?.ok || !data.user || cancelled) return;

        router.replace('/inicio');
      } catch {
        // Si no hay sesión disponible, el formulario permanece accesible.
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute -bottom-56 right-[-8rem] h-[36rem] w-[36rem] rounded-full bg-blue-200/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full items-center justify-center px-5 py-10 sm:px-8">
        <section className="mx-auto w-full max-w-[460px]" aria-labelledby="login-title">
          <div className="rounded-[28px] border border-slate-200/90 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h1 id="login-title" className="text-2xl font-semibold tracking-tight text-slate-950">
                Bienvenido
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Problemas para ingresar?{' '}
            <span className="font-medium text-slate-700">Contacta a soporte de sistemas.</span>
          </p>
          <p className="mt-3 text-center text-xs text-slate-400">
            Dictamy · Plataforma de gestión clínica
          </p>
        </section>
      </main>
    </div>
  );
}
