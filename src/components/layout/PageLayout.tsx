
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  className?: string;
}

export const PageLayout = ({
  children,
  title,
  description,
  requireAuth = false,
  className = "",
}: PageLayoutProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Handle loading state
  if (isLoading) {
    return <LoadingPage />;
  }
  
  // Handle authentication requirement
  if (requireAuth && !user) {
    toast({
      title: "Authentication Required",
      description: "You need to be logged in to access this page.",
      variant: "destructive",
    });
    
    navigate("/auth");
    return <LoadingPage />;
  }
  
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
