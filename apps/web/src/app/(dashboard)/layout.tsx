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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { ChartBarIcon, PlusIcon, CogIcon } from '@/components/icons';
import { PageLoading } from '@/components/loading';
import { cn } from '@/lib/utils';



const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { href: '/scan/new', label: 'New Scan', icon: PlusIcon },
];

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
          ? 'bg-primary/10 text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
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
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

function MobileNav({ pathname, isOpen, onClose, user, onSignOut }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background shadow-xl border-l border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/dashboard" onClick={onClose}>
            <Logo />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
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
                    ? 'bg-primary/10 text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          {user && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full border-border"
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
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

function UserMenu({ user, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground hidden lg:block">
            {user.name || user.email}
          </span>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onSignOut}
        className="text-muted-foreground border-border hover:bg-muted hover:text-foreground"
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
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
  onMenuOpen: () => void;
}

function Header({ pathname, user, onSignOut, onMenuOpen }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav pathname={pathname} />

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex">
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuOpen}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        pathname={pathname}
        user={session?.user}
        onSignOut={handleSignOut}
        onMenuOpen={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        pathname={pathname}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={session?.user}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} VibeAudit. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
