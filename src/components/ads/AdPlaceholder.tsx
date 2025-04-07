
import React from "react";
import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  type: "banner" | "sidebar" | "inline" | "leaderboard";
  className?: string;
}

export function AdPlaceholder({ type, className }: AdPlaceholderProps) {
  // Size mapping based on ad type
  const sizeMap = {
    banner: "h-[90px] w-full",
    sidebar: "h-[250px] w-[300px]",
    inline: "h-[280px] w-full",
    leaderboard: "h-[90px] w-[728px] max-w-full",
  };

  React.useEffect(() => {
    // Initialize ads
    try {
      if ((window as any).adsbygoogle && document.querySelectorAll('.adsbygoogle').length) {
        (window as any).adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={cn("mx-auto my-4 overflow-hidden bg-background/50 rounded-md border flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity", 
      sizeMap[type], 
      className
    )}>
      <ins 
        className="adsbygoogle" 
        style={{display: "block", width: "100%", height: "100%"}}
        data-ad-client="ca-pub-7483780622360467"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
