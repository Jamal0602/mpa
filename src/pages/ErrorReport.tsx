
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { ErrorReportForm } from "@/components/error-report/ErrorReportForm";
import { LimitReachedDisplay } from "@/components/error-report/LimitReachedDisplay";

const ErrorReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  // Check if user has reached daily limit
  useEffect(() => {
    const checkDailyLimit = async () => {
      if (!user) return;
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('error_reports')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());
          
        if (error) throw error;
        
        // Assuming a limit of 3 reports per day
        if (data && data.length >= 3) {
          setDailyLimitReached(true);
          
          // Calculate time until next day
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          
          const updateTimeRemaining = () => {
            const now = new Date();
            const diffMs = tomorrow.getTime() - now.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setTimeUntilReset(`${diffHrs}h ${diffMins}m`);
          };
          
          updateTimeRemaining();
          const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking daily limit:", error);
      }
    };
    
    checkDailyLimit();
  }, [user]);

  return (
    <PageLayout
      title="Report an Error"
      description="If you encountered a problem, please let us know and we'll address it as soon as possible."
      requireAuth={true}
    >
      <div className="max-w-3xl mx-auto">
        {dailyLimitReached ? (
          <LimitReachedDisplay timeUntilReset={timeUntilReset} />
        ) : (
          user && (
            <ErrorReportForm 
              userId={user.id} 
              userEmail={user.email || ""}
            />
          )
        )}
      </div>
    </PageLayout>
  );
};

export default ErrorReport;
