
import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingAnimation } from './loading-animation';

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
      <LoadingAnimation text={message} showPoweredBy={true} size="lg" />
    </div>
  );
};

export const LoadingSpinnerCGT = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <LoadingAnimation text="" showPoweredBy={true} size="sm" />
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
