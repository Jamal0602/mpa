
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Menu,
  ChevronDown,
  Home,
  Upload,
  Gift,
  Settings,
  LogOut,
  User,
  HelpCircle,
  FileText,
  Briefcase,
  AlertTriangle,
  BarChart2,
  Shield,
  Moon,
  Sun,
  Share2
} from "lucide-react";
import { useTheme } from "next-themes";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("👋 See you again soon!");
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Multi Project Association',
        text: 'Check out this awesome project management platform!',
        url: window.location.href,
      })
        .then(() => toast.success('Shared successfully!'))
        .catch((error) => toast.error(`Error sharing: ${error}`));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  const renderNavLink = (to: string, label: string, icon: React.ReactNode) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
      scrolled ? "border-b shadow-sm" : ""
    }`}>
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="hidden sm:inline">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-pulse">
              <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 7L12 12L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L12 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="transition-colors hover:text-primary">MPA</span>
        </Link>
        
        {/* Desktop navigation */}
        <div className="flex-1 hidden md:flex items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                  className={navigationMenuTriggerStyle()}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              {user && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/dashboard"
                      className={navigationMenuTriggerStyle()}
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Dashboard
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <FileText className="h-4 w-4 mr-2" />
                      Manage
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/upload"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Upload className="h-4 w-4" />
                                Upload
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Upload files and manage your content
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/referral"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Gift className="h-4 w-4" />
                                Refer
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Invite friends and earn rewards
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/work-with-us"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Briefcase className="h-4 w-4" />
                                Work with Us
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Join our team and collaborate on projects
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {isAdmin && (
                          <li>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/admin"
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                  <Shield className="h-4 w-4" />
                                  Admin Panel
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Manage users, settings, and analytics
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        )}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </>
              )}
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/help"
                  className={navigationMenuTriggerStyle()}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center ml-auto space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleShare}
            aria-label="Share page"
          >
            <Share2 className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {authLoading ? (
            <LoadingSpinner />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
                    <AvatarFallback>
                      {profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.username || profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {profile?.username || user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center cursor-pointer">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/report-error" className="flex items-center cursor-pointer">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report an Error
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="rounded-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          
          {/* Mobile menu trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChart2 className="h-5 w-5" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/upload"
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Upload className="h-5 w-5" />
                      Upload
                    </Link>
                    
                    <Link
                      to="/referral"
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Gift className="h-5 w-5" />
                      Refer
                    </Link>
                    
                    <Link
                      to="/account"
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Account Settings
                    </Link>
                    
                    <Link
                      to="/work-with-us"
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase className="h-5 w-5" />
                      Work with Us
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        Admin Panel
                      </Link>
                    )}
                  </>
                )}
                
                <Link
                  to="/help"
                  className="flex items-center gap-2 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className="h-5 w-5" />
                  Help
                </Link>
                
                <Button
                  variant="ghost"
                  className="flex justify-start pl-0"
                  onClick={() => {
                    handleShare();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
                
                {!user && (
                  <Link
                    to="/auth"
                    className="flex items-center gap-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign In
                  </Link>
                )}
                
                {user && (
                  <button
                    className="flex items-center gap-2 py-2 text-left"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
