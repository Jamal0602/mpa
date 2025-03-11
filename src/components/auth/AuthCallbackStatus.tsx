
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorStatusProps {
  error: string;
}

export const ErrorStatus = ({ error }: ErrorStatusProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-destructive">Authentication Error</h2>
      <p className="text-muted-foreground">{error}</p>
      <p className="mt-4 text-sm text-muted-foreground">Redirecting you back to login...</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => navigate('/auth')}
      >
        Return to Login
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

interface CreatingProfileStatusProps {
  provider?: string | null;
}

export const CreatingProfileStatus = ({ provider }: CreatingProfileStatusProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
        <CheckCircle className="h-6 w-6 text-primary animate-pulse" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Setting up your account...</h2>
      <p className="text-muted-foreground">
        We're creating your profile. This will only take a moment.
      </p>
      <div className="flex justify-center mt-4">
        <div className="h-2 w-40 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

interface LoadingStatusProps {
  provider?: string | null;
}

export const LoadingStatus = ({ provider }: LoadingStatusProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-2">Completing sign in...</h2>
      <p className="text-muted-foreground">
        {provider 
          ? `Authenticating with ${provider.charAt(0).toUpperCase() + provider.slice(1)}...` 
          : "Please wait while we redirect you."}
      </p>
    </div>
  );
};
