'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AuthCard from '@/components/AuthCard';
import LoginForm from '@/components/LoginForm';
import { getDefaultPathForUser } from '@/lib/module-navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!data?.ok || !data.user || cancelled) return;

        router.replace(
          getDefaultPathForUser({
            role: data.user.role as string | undefined,
            permissions: Array.isArray(data.user.permissions)
              ? data.user.permissions.map((permission: unknown) => String(permission))
              : [],
          }),
        );
      } catch {
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative grid min-h-dvh place-items-center bg-bg text-text">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8rem] h-64 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-200 via-brand-300 to-brand-400 opacity-30 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-10 h-64 w-96 rounded-full bg-gradient-to-br from-brand-100 to-brand-300 opacity-40 blur-2xl" />
      </div>

      <main className="w-full max-w-md px-4">
        <AuthCard title="Acceder" subtitle="Ingresa con tu documento y clave">
          <LoginForm />
        </AuthCard>

        <p className="mt-4 text-center text-xs text-muted">
          Problemas para ingresar? Contacta a soporte de sistemas.
        </p>
      </main>
    </div>
  );
}