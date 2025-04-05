
import React from "react";
import { Button } from "@/components/ui/button";
import { useForceDesktopMode } from "@/hooks/use-mobile";
import { Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";

export function DesktopModeToggle() {
  const { forceDesktop, toggleForceDesktop } = useForceDesktopMode();

  const handleToggle = () => {
    toggleForceDesktop();
    toast.success(
      forceDesktop ? "Switched to mobile view" : "Switched to desktop view", 
      { position: "bottom-right" }
    );
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2" 
      onClick={handleToggle}
      aria-label={forceDesktop ? "Switch to mobile view" : "Switch to desktop view"}
    >
      {forceDesktop ? (
        <>
          <Smartphone className="h-4 w-4" />
          <span className="hidden sm:inline">Mobile View</span>
        </>
      ) : (
        <>
          <Monitor className="h-4 w-4" />
          <span className="hidden sm:inline">Desktop View</span>
        </>
      )}
    </Button>
  );
}
