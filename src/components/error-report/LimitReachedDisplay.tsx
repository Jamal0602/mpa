
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LimitReachedDisplayProps {
  timeUntilReset: string;
}

export const LimitReachedDisplay = ({ timeUntilReset }: LimitReachedDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-card border rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">Daily Report Limit Reached</h2>
      <p className="text-muted-foreground mb-6">
        You've submitted the maximum number of error reports for today. Please try again tomorrow.
      </p>
      <p className="text-lg mb-6">
        Time until reset: <span className="font-bold">{timeUntilReset}</span>
      </p>
      <Button 
        variant="outline" 
        onClick={() => navigate("/")}
      >
        Return to Home
      </Button>
    </div>
  );
};
