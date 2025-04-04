
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
  
  const imageSize = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={cn("relative flex items-center justify-center", containerSize[size])}>
        {/* Use the provided GIF animation */}
        <img 
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhfCR-xdQKQeuroa8EDEszVZu84skuUlkpicjOdba-FuYcL5HSi0wNy0Wf5IZRdyqo2rPny12PrezvdDYsLK0drip35c0bogEro9cWI1OZGyMQNcizdBdKWpBhF0t9kO6jM5OuFyUWn9budhg67PU__b1tpCFvE96dMhEZCr6dw3-bpGA/s1600/Animation%20-%201743734436715.gif"
          alt="Loading animation"
          className={cn("rounded-full", imageSize[size])}
        />
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
