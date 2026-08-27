// This is a simplified toast hook implementation
import { useState } from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, duration = 5000 }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, duration };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);
    
    setTimeout(() => {
      setToasts((currentToasts) => 
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, duration);
    
    return id;
  };

  const dismiss = (toastId?: string) => {
    setToasts((currentToasts) => 
      toastId
        ? currentToasts.filter((toast) => toast.id !== toastId)
        : []
    );
  };

  return {
    toast,
    dismiss,
    toasts
  };
}
