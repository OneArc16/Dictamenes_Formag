import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyJwt } from '@/lib/auth';
import { getDefaultPathForRole } from '@/lib/module-navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const payload = await verifyJwt(token);
    redirect(getDefaultPathForRole(payload.role));
  } catch {
    redirect('/login');
  }
}