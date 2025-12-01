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
          <Toaster position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}