import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface AccessDeniedScreenProps {
  message?: string;
}

export function AccessDeniedScreen({
  message = 'Você não tem permissão para acessar esta área.',
}: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mb-2">Acesso Negado</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{message}</p>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
