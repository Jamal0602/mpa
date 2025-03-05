
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, LogIn, UserPlus, LogOut, Settings, BarChart2, CreditCard, HelpCircle, Share2, Bug } from "lucide-react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [keyPoints, setKeyPoints] = useState(0);
  const [isMasterMind, setIsMasterMind] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const appDownloadUrl = "https://drive.google.com/uc?id=1rhoD4s2jTh2deIZ1VqnWJjUDSST04lCq";
  
  // Cookie consent state
  const [cookieConsent, setCookieConsent] = useState(() => {
    return localStorage.getItem("cookieConsent") === "accepted";
  });

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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Multi Project Association (MPA)',
          text: 'Check out the MPA app for project management and collaboration!',
          url: window.location.origin,
        });
      } else {
        // If Web Share API is not available, open the dialog
        setIsShareDialogOpen(true);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      setIsShareDialogOpen(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast.success("Share link copied to clipboard!");
    setIsShareDialogOpen(false);
  };

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setCookieConsent(true);
    toast.success("Cookie preferences saved!");
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
      <Link to="/report-error" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
        <Bug className="h-4 w-4" />
        Report Issue
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
      <div className="flex flex-col items-end space-y-2">
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
        
        <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1 animate-fade-in">
          <Share2 className="h-4 w-4" />
          Share App
        </Button>
      </div>
    );
  };

  const AuthButtons = () => (
    <>
      {user ? (
        <UserMenu />
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex flex-col sm:flex-row gap-2">
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
          </div>
          
          <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1 mt-2 sm:mt-0 animate-fade-in">
            <Share2 className="h-4 w-4" />
            Share App
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      <motion.nav 
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
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
              className="transition-transform hover:rotate-12"
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

            <div className="hidden md:block">
              <AuthButtons />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share MPA App</DialogTitle>
            <DialogDescription>
              Share the MPA App with friends and colleagues
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Website Link</h3>
              <div className="flex items-center gap-2">
                <Input value={window.location.origin} readOnly />
                <Button onClick={copyShareLink}>Copy</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">App Download</h3>
              <div className="flex items-center gap-2">
                <Input value={appDownloadUrl} readOnly />
                <Button onClick={() => {
                  navigator.clipboard.writeText(appDownloadUrl);
                  toast.success("Download link copied!");
                }}>Copy</Button>
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={() => window.open(appDownloadUrl, '_blank')}
              >
                Download App
              </Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Share on Social Media</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full" onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out MPA - Multi Project Association!')}&url=${encodeURIComponent(window.location.origin)}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-400">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-700">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" className="w-full" onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out MPA - Multi Project Association! ' + window.location.origin)}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500 mr-2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  WhatsApp
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  window.open(`mailto:?subject=${encodeURIComponent('Check out MPA')}&body=${encodeURIComponent('I wanted to share this amazing project management app with you: ' + window.location.origin)}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-orange-500 mr-2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 shadow-md"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">Cookie Consent</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience. By continuing to use our site, you agree to our use of cookies.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCookieConsent(true)}>
                Decline
              </Button>
              <Button onClick={acceptCookies}>
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
