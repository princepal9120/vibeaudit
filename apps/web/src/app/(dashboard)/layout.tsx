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
  // if (!session) {
  //   router.push('/login');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-[#09090B] relative overflow-hidden">
      {/* Cool subtle grid/dot background */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272A_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none fixed top-0 left-0" />
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4ade80]/5 rounded-full blur-[100px] pointer-events-none fixed" />
      {/* Sidebar */}
      <Sidebar user={session?.user} />

      {/* Main Content */}
      <main className="md:ml-[72px] min-h-screen pt-16 pb-20 md:pt-0 md:pb-0">
        {/* Top Navigation */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-[#09090B]/80 px-4 md:px-10 backdrop-blur-xl border-b border-[#27272A] transition-all">
          <div className="flex flex-1 items-center gap-2">
            {/* Breadcrumbs */}
            <span className="text-sm font-medium tracking-tight text-[#52525B]">Console</span>
            <span className="text-[#27272A]">/</span>
            <span className="text-sm font-medium tracking-tight text-white">{session?.user?.name?.split(' ')[0] || 'User'}&apos;s Workspace</span>
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
