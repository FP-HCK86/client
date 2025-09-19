import { useState, useCallback } from 'react';

// Simple toast hook implementation
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      title,
      description,
      variant,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    // Return toast for manual dismissal if needed
    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id))
    };
  }, []);

  return { toast, toasts };
};

export default useToast;