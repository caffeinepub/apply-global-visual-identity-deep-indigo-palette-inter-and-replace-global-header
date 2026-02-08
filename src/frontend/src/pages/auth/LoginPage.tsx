import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/AuthProvider';
import { isMockMode } from '../../config/dataMode';
import { MockRoleSelector } from '../../auth/MockAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src="/assets/generated/fy-logo-mark.dim_512x512.png" 
              alt="First-Y" 
              className="h-16 w-16"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Bem-vindo ao First-Y</CardTitle>
            <CardDescription className="font-medium">
              CRM & Portal do Cliente
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMockMode() ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md text-sm text-center">
                <p className="font-medium mb-1">Modo MOCK Ativo</p>
                <p className="text-muted-foreground text-xs font-normal">
                  Selecione um papel para testar o sistema
                </p>
              </div>
              <MockRoleSelector />
            </div>
          ) : (
            <Button
              onClick={login}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Conectando...' : 'Entrar com Internet Identity'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
