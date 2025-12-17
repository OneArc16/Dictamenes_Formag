import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session'; // <-- AJUSTA esta ruta a donde tengas getSession()

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== 'ADMIN') redirect('/');
  return session;
}
