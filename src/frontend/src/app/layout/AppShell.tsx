import React, { type ReactNode } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../auth/AuthProvider';
import { useLocation } from '@tanstack/react-router';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Get current pathname from router location hook (reactive to navigation)
  const pathname = location.pathname;

  // Auth pages that should not show the shell
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/cadastro' ||
    pathname === '/';

  // Show shell when authenticated (even during loading) AND not on auth pages
  const showShell = isAuthenticated && !isAuthPage;

  if (!showShell) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-72 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
