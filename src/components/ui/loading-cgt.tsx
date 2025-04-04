
import React from "react";
import { cn } from "@/lib/utils";
import { LoadingAnimation } from "./loading-animation";

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
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <LoadingAnimation 
        text={text} 
        showPoweredBy={showPoweredBy} 
        size={size} 
      />
    </div>
  );
}
