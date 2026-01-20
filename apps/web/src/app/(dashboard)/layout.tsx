/**
 * Dashboard Layout
 * Provides navigation and common UI for authenticated pages
 *
 * Features:
 * - Responsive navigation (desktop + mobile)
 * - User session display
 * - Sign out functionality
 * - Active route highlighting
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { ShieldIcon, ChartBarIcon, PlusIcon } from '@/components/icons';
import { PageLoading } from '@/components/loading';
import { cn } from '@/lib/utils';

// ============================================
// Navigation Configuration
// ============================================

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { href: '/scan/new', label: 'New Scan', icon: PlusIcon },
];

// ============================================
// Logo Component
// ============================================

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group">
      <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
        <ShieldIcon className="h-5 w-5 text-white" />
      </div>
      <span className="text-xl font-bold text-slate-900">VibeAudit</span>
    </Link>
  );
}

// ============================================
// Desktop Navigation
// ============================================

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

function NavLink({ href, label, icon: Icon, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      )}
    >
      <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-600' : 'text-slate-400')} />
      {label}
    </Link>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          {...item}
          isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
        />
      ))}
    </nav>
  );
}

// ============================================
// Mobile Navigation
// ============================================

function MobileMenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface MobileNavProps {
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onSignOut: () => void;
}

function MobileNav({ pathname, isOpen, onClose, userEmail, onSignOut }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Logo />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-emerald-600' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          {userEmail && (
            <p className="text-sm text-slate-500 mb-3 truncate">{userEmail}</p>
          )}
          <Button
            variant="outline"
            className="w-full border-slate-200"
            onClick={() => {
              onClose();
              onSignOut();
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// User Menu Component
// ============================================

interface UserMenuProps {
  email?: string;
  onSignOut: () => void;
}

function UserMenu({ email, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      {email && (
        <span className="text-sm text-slate-500 hidden lg:block truncate max-w-[200px]">
          {email}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onSignOut}
        className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
      >
        Sign out
      </Button>
    </div>
  );
}

// ============================================
// Header Component
// ============================================

interface HeaderProps {
  pathname: string;
  userEmail?: string;
  onSignOut: () => void;
  onMenuOpen: () => void;
}

function Header({ pathname, userEmail, onSignOut, onMenuOpen }: HeaderProps) {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNav pathname={pathname} />

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex">
            <UserMenu email={userEmail} onSignOut={onSignOut} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <MobileMenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// Main Layout Component
// ============================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <Header
        pathname={pathname}
        userEmail={session?.user?.email}
        onSignOut={handleSignOut}
        onMenuOpen={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        pathname={pathname}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userEmail={session?.user?.email}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} VibeAudit. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
