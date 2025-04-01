
import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[100px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-2 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);
