'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Scan, Settings, Menu, X, FileText } from 'lucide-react';
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
  { href: '/prd-review', icon: FileText, label: 'PRD Review' },
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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] bg-sidebar border-r border-sidebar-border flex-col items-center justify-between py-6 z-50">
        {/* Top Section */}
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <Link href="/dashboard">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity">
              <span className="text-primary-foreground text-xl font-semibold">V</span>
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
                    isActive ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-sidebar-foreground')} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - Avatar */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/account"
            className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Account"
          >
            {user?.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-sidebar-foreground text-xs font-medium">{getInitials()}</span>
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground text-lg font-semibold">V</span>
          </div>
          <span className="text-foreground font-semibold">VibeAudit</span>
        </Link>

        {/* Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-sidebar-foreground"
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
          'md:hidden fixed top-16 right-0 bottom-0 w-64 bg-sidebar border-l border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out',
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
                  isActive ? 'bg-sidebar-accent text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50">
            <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
              {user?.image ? (
                <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="text-sidebar-foreground text-xs font-medium">{getInitials()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sidebar-foreground text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-sidebar-foreground/70 text-xs truncate">{user?.email || ''}</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2',
                isActive ? 'text-primary' : 'text-sidebar-foreground'
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
