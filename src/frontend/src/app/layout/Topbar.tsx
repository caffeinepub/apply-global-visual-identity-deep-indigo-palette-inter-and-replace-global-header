import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/AuthProvider';
import { useCurrentOrg } from '../../org/OrgProvider';
import { isMockMode } from '../../config/dataMode';
import { MockRoleSelector } from '../../auth/MockAuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Building2, RefreshCw } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export function Topbar() {
  const { user, logout } = useAuth();
  const { currentOrg } = useCurrentOrg();
  const navigate = useNavigate();

  const isFirstyRole = user?.role === 'FIRSTY_ADMIN' || user?.role === 'FIRSTY_CONSULTANT';

  const handleSwitchOrg = () => {
    navigate({ to: '/selecionar-organizacao' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center">
          <BrandLogo className="h-12 w-auto object-contain" />
        </div>

        <div className="flex-1" />

        {/* Org atual */}
        {currentOrg && (
          <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1.5 rounded-md bg-muted text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{currentOrg.name}</span>
          </div>
        )}

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user.name}</p>
                  {user.email && (
                    <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize font-normal">{user.role.replace('_', ' ')}</p>
                </div>
              </DropdownMenuLabel>
              
              {isFirstyRole && currentOrg && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSwitchOrg}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Trocar Organização
                  </DropdownMenuItem>
                </>
              )}
              
              {isMockMode() && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Modo MOCK - Trocar papel:</p>
                    <MockRoleSelector />
                  </div>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
