import { redirect } from 'next/navigation';

import { getAuthorizationContext } from '@/lib/auth/authorization';

export default async function Home() {
  const authorization = await getAuthorizationContext();
  redirect(authorization ? '/inicio' : '/login');
}
