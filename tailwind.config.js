import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}', // si tienes modules/
  ],
  theme: {
    extend: {
      colors: {
        // Paleta azul tipo dashboarddna
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Atajos basados en variables CSS
        bg: 'var(--bg)',           // fondo general (blanco azulado)
        panel: 'var(--panel)',     // tarjetas/paneles (blanco)
        subtle: 'var(--subtle)',   // bordes/lines
        text: 'var(--text)',       // texto principal
        muted: 'var(--muted)',     // texto secundario
        primary: 'var(--primary)', // botón/acción
        ring: 'var(--ring)',       // focus ring
      },
    },
  },
  plugins: [],
};
export default config;
