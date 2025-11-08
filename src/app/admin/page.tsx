import { getSession } from '@/lib/session';
import AppNav from '@/components/AppNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="text-white min-h-dvh bg-slate-950">
      <AppNav name={session?.name} role={session?.role} />
      {children}
    </div>
  );
}
