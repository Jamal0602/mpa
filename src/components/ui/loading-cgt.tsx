
import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
  showPoweredBy?: boolean;
}

export const LoadingSpinnerCGT = ({ 
  size = "medium", 
  text = "Loading", 
  className = "",
  showPoweredBy = true 
}: LoadingProps) => {
  const sizeClasses = {
    small: "h-5 w-5",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base"
  };

  const containerSize = {
    small: "min-h-[60px]",
    medium: "min-h-[100px]",
    large: "min-h-[150px]"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", containerSize[size], className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="rounded-full"
        >
          <Loader2 className={cn("text-primary", sizeClasses[size])} />
        </motion.div>
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn("text-muted-foreground mt-2", textSizes[size])}
        >
          {text}
        </motion.p>
      )}
      
      {showPoweredBy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5"
        >
          <span>Powered by</span>
          <span className="font-bold bg-gradient-cgt bg-clip-text text-transparent">CGT</span>
        </motion.div>
      )}
    </div>
  );
};

export const LoadingPageCGT = ({
  text = "Loading Your Experience",
  className = "",
  showPoweredBy = true
}: Omit<LoadingProps, 'size'>) => {
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen", className)}>
      <motion.div 
        className="space-y-6 text-center"
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={logoVariants}
          className="relative mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-cgt blur-xl opacity-30 rounded-full" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Loader2 className="h-16 w-16 text-primary" />
          </motion.div>
        </motion.div>
        
        <motion.p 
          variants={textVariants}
          custom={0.2}
          className="text-lg font-medium"
        >
          {text}
        </motion.p>
        
        <motion.div
          variants={textVariants}
          custom={0.4}
          className="text-muted-foreground text-sm"
        >
          This may take a moment
        </motion.div>
        
        {showPoweredBy && (
          <motion.div
            variants={textVariants}
            custom={0.8}
            className="mt-8 flex items-center justify-center gap-2 text-sm"
          >
            <span className="text-muted-foreground">Powered by</span>
            <motion.span 
              className="font-bold text-lg bg-gradient-cgt bg-clip-text text-transparent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              CGT
            </motion.span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
