
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "@/components/ui/loading";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Handle authentication requirement
  if (requireAuth && !user) {
    navigate("/auth");
    return <LoadingPage />;
  }
  
  return (
    <div className={className}>
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
