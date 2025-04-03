
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Github } from "lucide-react";

interface LimitReachedDisplayProps {
  maxReports: number;
}

export const LimitReachedDisplay = ({ maxReports }: LimitReachedDisplayProps) => {
  const navigate = useNavigate();
  
  const openGitHubIssues = () => {
    window.open("https://github.com/Jamal0602/MPA/issues", "_blank");
  };
  
  return (
    <div className="bg-card border rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Daily Report Limit Reached</h2>
      <p className="text-muted-foreground mb-6">
        You've submitted the maximum number of error reports for today. Please try again tomorrow.
      </p>
      <p className="text-lg mb-6">
        You've used all {maxReports} of your daily report allowance.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
        <Button 
          variant="default" 
          onClick={openGitHubIssues}
          className="gap-2"
        >
          <Github className="h-4 w-4" />
          View GitHub Issues
        </Button>
      </div>
    </div>
  );
};
