'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Sidebar } from '@/components/sidebar';
import { PageLoading } from '@/components/loading';
import { CommandMenu } from '@/components/dashboard/command-menu';

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
        {/* Top Navigation */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-background/50 px-4 md:px-10 backdrop-blur-xl border-b transition-all">
          <div className="flex flex-1 items-center gap-2">
            {/* Future Breadcrumbs */}
            <span className="text-sm font-medium tracking-tight text-muted-foreground/70">Console</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm font-medium tracking-tight text-foreground">{session?.user?.name?.split(' ')[0] || 'User'}'s Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <CommandMenu />
          </div>
        </div>

        <div className="px-4 py-6 md:px-10 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
