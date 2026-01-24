'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Scan, Settings, User } from 'lucide-react';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scan/new', icon: Scan, label: 'New Scan' },
  { href: '/account', icon: Settings, label: 'Settings' },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] bg-[#111827] flex flex-col items-center justify-between py-6 z-50">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard">
          <div className="w-10 h-10 bg-[#CCFF00] rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity">
            <span className="text-[#111827] text-xl font-semibold">V</span>
          </div>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex flex-col items-center gap-2 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  'w-11 h-11 rounded-lg flex items-center justify-center transition-colors',
                  isActive
                    ? 'bg-[#1A1F26]'
                    : 'hover:bg-[#1A1F26]/50'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    isActive ? 'text-[#CCFF00]' : 'text-[#9CA3AF]'
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Avatar */}
      <div className="flex flex-col items-center gap-4">
        <Link
          href="/account"
          className="w-10 h-10 bg-[#4B5563] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          title="Account"
        >
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-medium">{getInitials()}</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
