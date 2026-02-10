import { toast, ExternalToast } from 'sonner';

/**
 * Global Sonner toast configuration
 * Patches toast.success to use 1-second duration by default
 */
export function configureSonner() {
  // Store the original toast.success function
  const originalSuccess = toast.success;

  // Override toast.success to inject duration: 1000 by default
  // Using type assertion to work around complex React.ReactNode type incompatibilities
  (toast as any).success = (message: any, data?: ExternalToast) => {
    return originalSuccess(message, {
      duration: 1000,
      ...data, // Allow caller to override if needed
    });
  };
}
