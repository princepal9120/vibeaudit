'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Scan, Settings, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    requestAnimationFrame(() => {
      setMobileMenuOpen(false);
    });
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] bg-[#111827] flex-col items-center justify-between py-6 z-50">
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
                    isActive ? 'bg-[#1A1F26]' : 'hover:bg-[#1A1F26]/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-[#CCFF00]' : 'text-[#9CA3AF]')} />
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
              <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-white text-xs font-medium">{getInitials()}</span>
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111827] flex items-center justify-between px-4 z-50">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#CCFF00] rounded-lg flex items-center justify-center">
            <span className="text-[#111827] text-lg font-semibold">V</span>
          </div>
          <span className="text-white font-semibold">VibeAudit</span>
        </Link>

        {/* Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden fixed top-16 right-0 bottom-0 w-64 bg-[#111827] z-50 transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive ? 'bg-[#1A1F26] text-[#CCFF00]' : 'text-[#9CA3AF] hover:bg-[#1A1F26]/50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1A1F26]">
          <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1A1F26]/50">
            <div className="w-10 h-10 bg-[#4B5563] rounded-full flex items-center justify-center">
              {user?.image ? (
                <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="text-white text-xs font-medium">{getInitials()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-[#9CA3AF] text-xs truncate">{user?.email || ''}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#111827] border-t border-[#1A1F26] flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2',
                isActive ? 'text-[#CCFF00]' : 'text-[#9CA3AF]'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
