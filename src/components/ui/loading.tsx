
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export const LoadingPage = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-muted-foreground mt-4">Powered by CGT</p>
    </div>
  );
};

export const LoadingSpinnerCGT = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-xs text-muted-foreground">Powered by CGT</p>
    </div>
  );
};

export const Loading = LoadingPage;

export const LoadingButton = ({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
};
