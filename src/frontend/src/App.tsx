import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './app/router/routes';
import { AuthProvider } from './auth/AuthProvider';
import { OrgProvider } from './org/OrgProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useMemo, useEffect } from 'react';
import { configureSonner } from './toast/configureSonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  const router = useMemo(
    () =>
      createRouter({
        routeTree,
        context: {
          queryClient,
        },
        defaultPreload: 'intent',
      }),
    []
  );

  // Configure Sonner toast behavior on mount
  useEffect(() => {
    configureSonner();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <OrgProvider>
            <RouterProvider router={router} />
            <Toaster />
          </OrgProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
