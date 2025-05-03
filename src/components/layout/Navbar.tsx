
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isMobileApp } from "@/utils/linkHandler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const isBeta = import.meta.env.VITE_APP_ENV === 'beta';

interface MobileNavItemProps {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "ghost";
  onClick?: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ href, children, variant = "default", onClick }) => {
  return (
    <Button asChild variant={variant} className="w-full justify-start">
      <Link to={href} onClick={onClick}>{children}</Link>
    </Button>
  );
};

interface DesktopNavItemProps {
  href: string;
  children: React.ReactNode;
}

const DesktopNavItem: React.FC<DesktopNavItemProps> = ({ href, children }) => {
  return (
    <li>
      <Button asChild variant="link" className="font-medium">
        <Link to={href}>{children}</Link>
      </Button>
    </li>
  );
};

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex justify-between items-center border-b pb-4">
                <Link to="/" className="flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/f284a2e3-584a-4f26-9ff7-1f6d2c6682e5.png" 
                    alt="MPA Logo" 
                    className="h-8 w-auto" 
                  />
                  <span className="font-semibold">MPA</span>
                </Link>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
              <nav className="flex-1 flex flex-col gap-4 py-4">
                <MobileNavItem href="/">Home</MobileNavItem>
                <MobileNavItem href="/features">Features</MobileNavItem>
                <MobileNavItem href="/services">Services</MobileNavItem>
                <MobileNavItem href="/blog">Blog</MobileNavItem>
                <MobileNavItem href="/help">Help</MobileNavItem>
                <MobileNavItem href="/work-with-us">Work With Us</MobileNavItem>
                {user && (
                  <>
                    <MobileNavItem href="/dashboard">Dashboard</MobileNavItem>
                    <MobileNavItem href="/account">Account</MobileNavItem>
                    <MobileNavItem variant="ghost" href="#" onClick={handleSignOut}>
                      Sign Out
                    </MobileNavItem>
                  </>
                )}
              </nav>
              <div className="border-t pt-4">
                <ModeToggle />
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f284a2e3-584a-4f26-9ff7-1f6d2c6682e5.png" 
              alt="MPA Logo" 
              className="h-8 w-auto" 
            />
            <span className="hidden font-semibold sm:inline-block">
              Multi Project Association
            </span>
            <span className="font-semibold sm:hidden">MPA</span>
            {isBeta && (
              <Badge variant="destructive" className="h-5">
                Beta
              </Badge>
            )}
          </Link>

          <nav className="mx-6 hidden md:block">
            <ul className="flex items-center gap-6">
              <DesktopNavItem href="/features">Features</DesktopNavItem>
              <DesktopNavItem href="/services">Services</DesktopNavItem>
              <DesktopNavItem href="/blog">Blog</DesktopNavItem>
              <DesktopNavItem href="/help">Help</DesktopNavItem>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${user.email}`} alt={user.email} />
                    <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account">Settings</Link>
                </DropdownMenuItem>
                {user.email === 'admin@example.com' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
