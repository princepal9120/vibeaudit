'use client';
/* eslint-disable @next/next/no-img-element -- auth avatar URLs are provider-hosted and not statically allowlisted */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Scan, Settings, Menu, X, FileText, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scan/new', icon: Scan, label: 'New Audit' },
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
          <Link href="/dashboard" className="group">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.4)]">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
          </Link>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-1.5 mt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 relative z-10" />
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"
                      style={{ left: -1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {/* Tooltip */}
                  <span className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - Avatar */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/account"
            className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all"
            title="Account"
          >
            {user?.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-sidebar-foreground text-xs font-semibold">{getInitials()}</span>
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <span
            className="text-foreground font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            VibeAudit
          </span>
        </Link>

        {/* Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed top-16 right-0 bottom-0 w-72 bg-sidebar border-l border-sidebar-border z-50"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
              <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-accent/50 transition-colors">
                <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-sidebar-foreground text-xs font-semibold">{getInitials()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground text-sm font-medium truncate">{user?.name || 'User'}</div>
                  <div className="text-muted-foreground text-xs truncate">{user?.email || ''}</div>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 transition-colors',
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
