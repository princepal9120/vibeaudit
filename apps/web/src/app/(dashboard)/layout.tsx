'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Sidebar } from '@/components/sidebar';
import { PageLoading } from '@/components/loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Loading state
  if (isPending) {
    return <PageLoading />;
  }

  // Note: Authentication redirect is commented out for development
  // Uncomment in production:
  // if (!session) {
  //   router.push('/login');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar user={session?.user} />

      {/* Main Content */}
      <main className="ml-[72px] min-h-screen">
        <div className="px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
