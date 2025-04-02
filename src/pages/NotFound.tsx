
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, HelpCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Referrer:",
      document.referrer,
      "User Agent:",
      navigator.userAgent
    );
  }, [location.pathname]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReturnHome = () => {
    navigate("/");
    toast.info("Redirected to home page");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-6">Oops! The page you're looking for doesn't exist.</p>
        <p className="text-muted-foreground mb-4">The page at <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code> could not be found.</p>
        <p className="text-sm text-muted-foreground mb-8">This might be due to a routing issue or a mistyped URL.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default" onClick={handleReturnHome} className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
          </Button>
          <Link to="/help">
            <Button variant="outline" className="w-full sm:w-auto">
              <HelpCircle className="mr-2 h-4 w-4" />
              Get Help
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
