import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Users, FolderKanban, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileNavMenu } from './MobileNavMenu';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Contatos', path: '/contatos', icon: Users },
  { label: 'Portal', path: '/portal/dashboard', icon: FolderKanban },
];

export function BottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      <MobileNavMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
