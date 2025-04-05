
import React from "react";
import { Button } from "@/components/ui/button";
import { useForceDesktopMode } from "@/hooks/use-mobile";
import { Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          aria-label={forceDesktop ? "Device view settings" : "Device view settings"}
        >
          {forceDesktop ? (
            <>
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">View Mode</span>
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">View Mode</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          if (forceDesktop) return;
          handleToggle();
        }}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Desktop View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          if (!forceDesktop) return;
          handleToggle();
        }}>
          <Smartphone className="mr-2 h-4 w-4" />
          <span>Mobile View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
