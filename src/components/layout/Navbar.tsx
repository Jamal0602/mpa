
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, LogIn, UserPlus, LogOut, Settings, BarChart2, CreditCard, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/ui/notification-center";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [keyPoints, setKeyPoints] = useState(0);
  const [isMasterMind, setIsMasterMind] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("key_points, username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        // Use optional chaining to safely access key_points
        setKeyPoints(data?.key_points ?? 0);
        setIsMasterMind(data?.username === "mastermind");
      }
    };

    fetchProfile();

    const channel = supabase
      .channel("navbar-points")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            // Use optional chaining and nullish coalescing here too
            setKeyPoints(payload.new?.key_points ?? 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully signed out!");
    }
  };

  const NavItems = () => (
    <>
      <Link to="/" className="text-foreground hover:text-primary transition-colors">
        Home
      </Link>
      <Link to="/features" className="text-foreground hover:text-primary transition-colors">
        Features
      </Link>
      <Link to="/subscription" className="text-foreground hover:text-primary transition-colors">
        Spark Points
      </Link>
      <Link to="/upload" className="text-foreground hover:text-primary transition-colors">
        Upload
      </Link>
      <Link to="/help" className="text-foreground hover:text-primary transition-colors">
        Help
      </Link>
      <Link to="/work-with-us" className="text-foreground hover:text-primary transition-colors">
        Work With Us
      </Link>
      <Link to="/referral" className="text-foreground hover:text-primary transition-colors">
        Referrals
      </Link>
      {(isAdmin && isMasterMind) && (
        <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors group relative">
          Admin
          <Badge variant="outline" className="absolute -top-3 -right-3 group-hover:bg-primary group-hover:text-primary-foreground animate-pulse">
            MasterMind
          </Badge>
        </Link>
      )}
    </>
  );

  const UserMenu = () => {
    if (!user) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                <CreditCard className="h-3 w-3" />
                <span>{keyPoints} Spark Points</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <BarChart2 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/account">
              <Settings className="mr-2 h-4 w-4" />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const AuthButtons = () => (
    <>
      {user ? (
        <UserMenu />
      ) : (
        <>
          <Link to="/auth">
            <Button variant="ghost">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </Link>
          <Link to="/auth">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Sign up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Multi Project Association</span>
          <span className="text-lg text-muted-foreground">(MPA)</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavItems />
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{keyPoints} Spark Points</span>
            </div>
          )}

          {user && <NotificationCenter />}
        
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-4">
                <NavItems />
                <AuthButtons />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex items-center gap-4">
            <AuthButtons />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
