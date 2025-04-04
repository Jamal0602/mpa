
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
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
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      
      <Switch 
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-primary"
      />
      
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
