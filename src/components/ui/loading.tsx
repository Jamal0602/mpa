
import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="relative">
      <Loader2 className="h-12 w-12 animate-[spin_2s_linear_infinite] text-primary" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-4 bg-primary/50 rounded-full animate-[ping_1s_ease-in-out_infinite]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
      </div>
    </div>
  </div>
);

export const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4 text-center">
      <LoadingSpinner />
      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);
