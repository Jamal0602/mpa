
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user, profile } = useAuth();
  const isDark = theme === "dark";

  // Initialize theme from profile preference
  useEffect(() => {
    if (profile?.theme_preference && profile.theme_preference !== 'system') {
      setTheme(profile.theme_preference);
    }
  }, [profile, setTheme]);

  const toggleTheme = async () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    
    // Save preference to profile if user is logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);
          
        toast.success(`Theme set to ${newTheme}`, {
          description: "Your preference has been saved",
          position: "bottom-right"
        });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
