
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingAnimationProps {
  text?: string;
  showPoweredBy?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingAnimation({
  text = "Loading...",
  showPoweredBy = true,
  size = "md",
}: LoadingAnimationProps) {
  // Size mapping for different elements
  const containerSize = {
    sm: "w-24 h-24",
    md: "w-32 h-32", 
    lg: "w-40 h-40",
  };
  
  const circleSize = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };
  
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  
  const poweredBySize = {
    sm: "text-[8px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={cn("relative", containerSize[size])}>
        <motion.div
          className={cn(
            "absolute border-2 border-transparent border-t-primary border-r-primary rounded-full",
            circleSize[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          className={cn(
            "absolute border-2 border-transparent border-b-secondary border-l-secondary rounded-full",
            circleSize[size]
          )}
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CGT</div>
        </motion.div>
      </div>
      
      {text && (
        <div className={cn("mt-4 text-center", textSize[size])}>
          <p className="animate-pulse font-medium">{text}</p>
        </div>
      )}
      
      {showPoweredBy && (
        <div className={cn("mt-1 opacity-70", poweredBySize[size])}>
          <p>Powered by [CGT]</p>
        </div>
      )}
    </div>
  );
}
