
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  text?: string;
  showPoweredBy?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LoadingAnimation({
  text = "Loading...",
  showPoweredBy = true,
  className,
  size = "md",
  color = "primary",
}: LoadingAnimationProps) {
  const sizes = {
    sm: { dot: "h-1.5 w-1.5", container: "gap-1" },
    md: { dot: "h-2.5 w-2.5", container: "gap-2" },
    lg: { dot: "h-3.5 w-3.5", container: "gap-3" },
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={cn("flex items-center justify-center", sizes[size].container)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(`rounded-full bg-${color}`, sizes[size].dot)}
            variants={dotVariants}
            animate="animate"
            initial="initial"
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.6,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
      
      <p className="mt-4 text-center font-medium">{text}</p>
      
      {showPoweredBy && (
        <div className="mt-8 text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-primary">CGT</span>
        </div>
      )}
    </div>
  );
}
