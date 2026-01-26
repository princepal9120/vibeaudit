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

  // Redirect to login if not authenticated
  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar user={session?.user} />

      {/* Main Content */}
      <main className="md:ml-[72px] min-h-screen pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="px-4 py-6 md:px-10 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
