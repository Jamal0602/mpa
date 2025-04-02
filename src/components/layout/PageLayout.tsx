
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingPageCGT } from "@/components/ui/loading-cgt";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  className?: string;
  animate?: boolean;
}

export const PageLayout = ({
  children,
  title,
  description,
  requireAuth = false,
  className = "",
  animate = true,
}: PageLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for auth requirement 
  if (requireAuth && !user) {
    toast({
      title: "Authentication Required",
      description: "You need to be logged in to access this page.",
      variant: "destructive",
    });
    
    navigate("/auth");
    return <LoadingPageCGT text="Redirecting to login..." />;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  if (animate) {
    return (
      <motion.div 
        className={className}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {(title || description) && (
          <motion.div className="mb-8" variants={itemVariants}>
            {title && (
              <motion.h1 
                className="text-3xl font-bold text-gradient"
                variants={itemVariants}
              >
                {title}
              </motion.h1>
            )}
            {description && (
              <motion.p 
                className="text-muted-foreground mt-2"
                variants={itemVariants}
              >
                {description}
              </motion.p>
            )}
          </motion.div>
        )}
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      </motion.div>
    );
  }
  
  // Non-animated version
  return (
    <div className={`animate-in fade-in-50 duration-300 ${className}`}>
      {(title || description) && (
        <div className="mb-8">
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
