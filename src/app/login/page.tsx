'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import LoginForm from '@/components/LoginForm';

// 👇 mismo mapa de rol → ruta que usamos en el middleware
function roleToPath(role?: string) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ADMISIONISTA') return '/admisiones';
  if (role === 'MEDICO') return '/medico';
  return '/login';
}

export default function LoginPage() {
  const router = useRouter();

  // 🔹 Si ya hay sesión válida, redirigimos desde aquí también
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) return; // 401/404/etc → no hacemos nada

        const data = await res.json();
        if (!data?.ok || !data.user || cancelled) return;

        const role = data.user.role as string | undefined;
        router.replace(roleToPath(role));
      } catch {
        // si falla, simplemente dejamos el login visible
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative grid min-h-dvh place-items-center bg-bg text-text">
      {/* Fondo sutil azul */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 h-64 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-200 via-brand-300 to-brand-400 opacity-30 blur-3xl" />
        <div className="absolute h-64 rounded-full -bottom-32 left-10 w-96 bg-gradient-to-br from-brand-100 to-brand-300 opacity-40 blur-2xl" />
      </div>

      <main className="w-full max-w-md px-4">
        <AuthCard
          title="Acceder"
          subtitle="Ingresa con tu documento y clave"
        >
          <LoginForm />
        </AuthCard>

        <p className="mt-4 text-xs text-center text-muted">
          ¿Problemas para ingresar? Contacta a soporte de sistemas.
        </p>
      </main>
    </div>
  );
}
