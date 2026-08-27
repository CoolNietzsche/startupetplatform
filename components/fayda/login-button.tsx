'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFaydaAuth } from '@/hooks/use-fayda-auth';
import { Loader2 } from 'lucide-react';

interface FaydaLoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

/**
 * A button component for authenticating with Ethiopia's National ID system
 */
export const FaydaLoginButton: React.FC<FaydaLoginButtonProps> = ({ 
  className = '',
  variant = 'default',
}) => {
  const { login, isLoading } = useFaydaAuth();

  return (
    <Button
      variant={variant}
      className={`flex items-center gap-2 ${className}`}
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-4 w-4"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M16 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
          <path d="M16 14h.01" />
          <path d="M8 10h5" />
          <path d="M8 14h3" />
        </svg>
      )}
      Log in with National ID
    </Button>
  );
};

export default FaydaLoginButton;
