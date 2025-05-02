
import React, { useEffect, useState } from "react";
import { ConstructionPopup } from "./ConstructionPopup";
import { fetchConstructionSettings } from "@/utils/constructionProgress";

interface ConstructionWrapperProps {
  children: React.ReactNode;
}

export const ConstructionWrapper: React.FC<ConstructionWrapperProps> = ({ children }) => {
  const [isConstructionMode, setIsConstructionMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkConstructionMode = async () => {
      const settings = await fetchConstructionSettings();
      setIsConstructionMode(settings?.construction_mode || false);
      setIsLoading(false);
    };

    checkConstructionMode();
    
    // Check status periodically
    const interval = setInterval(checkConstructionMode, 60000); // every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    // Save to local storage so it stays dismissed for this session
    localStorage.setItem('construction_dismissed', 'true');
  };
  
  useEffect(() => {
    // Check if popup was dismissed in this session
    const wasDismissed = localStorage.getItem('construction_dismissed') === 'true';
    setDismissed(wasDismissed);
  }, []);

  // Don't render popup if not in construction mode, loading, or dismissed
  const showPopup = isConstructionMode && !isLoading && !dismissed;

  return (
    <>
      {children}
      {showPopup && <ConstructionPopup onClose={handleDismiss} showCloseButton={true} />}
    </>
  );
};
