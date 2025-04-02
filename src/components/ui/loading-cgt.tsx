
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingPageCGTProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showPoweredBy?: boolean;
}

export function LoadingPageCGT({
  text = "Loading...",
  className,
  size = "md",
  showPoweredBy = true,
}: LoadingPageCGTProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
        <p className="text-center font-medium">{text}</p>
        
        {showPoweredBy && (
          <div className="mt-8 text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-primary">CGT</span>
          </div>
        )}
      </div>
    </div>
  );
}
