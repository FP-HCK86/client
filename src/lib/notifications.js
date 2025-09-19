// Simple toast wrapper utilities for success and error messages
// Can be expanded later or integrated with a central notification system.
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { toast } = useToast();

  const showSuccess = (title, description) => {
    toast({ title: title || 'Success', description });
  };

  const showError = (title, description) => {
    toast({ title: title || 'Error', description, variant: 'destructive' });
  };

  return { showSuccess, showError };
};

export default useNotifications;