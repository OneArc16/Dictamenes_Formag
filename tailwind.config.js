import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        subtle: 'var(--subtle)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        ring: 'var(--ring)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config; // (requiere "type":"module" en package.json)
