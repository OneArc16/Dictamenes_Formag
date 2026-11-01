// app/layout.tsx
import './globals.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ReactQueryProvider>
          {children}
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--panel)',
                color: 'var(--text)',
                border: '1px solid var(--subtle)',
                borderRadius: '0.75rem',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)',
                padding: '10px 14px',
                fontSize: '0.875rem',
                fontWeight: 500,
                maxWidth: '420px',
              },
              success: {
                iconTheme: { primary: '#059669', secondary: '#ecfdf5' },
                style: { borderLeft: '4px solid #059669' },
              },
              error: {
                duration: 6000,
                iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
                style: { borderLeft: '4px solid #dc2626' },
              },
              loading: {
                iconTheme: { primary: '#2563eb', secondary: '#dbeafe' },
                style: { borderLeft: '4px solid #2563eb' },
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}