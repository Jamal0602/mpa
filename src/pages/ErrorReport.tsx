
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ErrorReportForm } from "@/components/error-report/ErrorReportForm";
import { LimitReachedDisplay } from "@/components/error-report/LimitReachedDisplay";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const ErrorReport = () => {
  const navigate = useNavigate();
  const [limitReached, setLimitReached] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("24:00:00");
  
  const handleSuccess = () => {
    // Redirect to homepage after successful report submission
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <PageLayout 
      title="Report an Error" 
      description="Help us improve by reporting bugs and issues"
      requireAuth={true}
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-muted-foreground">
          Found a bug or issue? Let us know so we can improve MPA for everyone.
        </p>
        
        <Button 
          variant="outline"
          className="gap-2"
          onClick={() => window.open("https://github.com/Jamal0602/MPA/issues/new", "_blank")}
        >
          <Github className="h-4 w-4" />
          Report on GitHub
        </Button>
      </div>
      
      {limitReached ? (
        <LimitReachedDisplay timeUntilReset={timeUntilReset} />
      ) : (
        <ErrorReportForm 
          onSuccess={handleSuccess}
        />
      )}
    </PageLayout>
  );
};

export default ErrorReport;
