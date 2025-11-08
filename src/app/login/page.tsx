'use client';

import AuthCard from '@/components/AuthCard';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center bg-bg text-text">
      {/* Fondo sutil azul */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 h-64 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-200 via-brand-300 to-brand-400 opacity-30 blur-3xl" />
        <div className="absolute h-64 rounded-full -bottom-32 left-10 w-96 bg-gradient-to-br from-brand-100 to-brand-300 opacity-40 blur-2xl" />
      </div>

      <main className="w-full max-w-md px-4">
        <AuthCard title="Acceder" subtitle="Ingresa con tu documento y clave">
          <LoginForm />
        </AuthCard>

        <p className="mt-4 text-xs text-center text-muted">
          ¿Problemas para ingresar? Contacta a soporte de sistemas.
        </p>
      </main>
    </div>
  );
}
