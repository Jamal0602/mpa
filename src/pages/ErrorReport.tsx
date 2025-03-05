
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Github, Bug, ExternalLink, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const ERROR_REPORT_LIMIT = 5;
const GITHUB_ISSUES_URL = "https://github.com/Jamal0602/MPA/issues/new";

const ErrorReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remainingReports, setRemainingReports] = useState(ERROR_REPORT_LIMIT);
  const [loading, setLoading] = useState(true);
  
  // Check how many reports the user has submitted today
  useEffect(() => {
    const checkReportLimit = async () => {
      if (!user) return;
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count, error } = await supabase
          .from("error_reports")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", today.toISOString());
          
        if (error) throw error;
        
        if (count !== null) {
          setRemainingReports(ERROR_REPORT_LIMIT - count);
        }
      } catch (error) {
        console.error("Error checking report limit:", error);
        toast.error("Failed to check report limit");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      checkReportLimit();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error("Please provide both a title and description");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Save to database
      const { error } = await supabase
        .from("error_reports")
        .insert({
          user_id: user?.id,
          title,
          description,
          steps_to_reproduce: steps,
          status: "pending"
        });
        
      if (error) throw error;
      
      toast.success("Error report submitted successfully");
      
      // Redirect after a brief delay
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setSteps("");
        navigate("/");
      }, 2000);
      
      // Update remaining reports
      setRemainingReports(prev => prev - 1);
      
    } catch (error: any) {
      toast.error(`Error submitting report: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGitHubRedirect = () => {
    // Prepare GitHub issue template with form data
    const issueTitle = encodeURIComponent(title);
    const issueBody = encodeURIComponent(
      `## Description\n${description}\n\n## Steps to reproduce\n${steps}\n\n_Submitted via MPA error reporting_`
    );
    
    // Open GitHub issues page with pre-filled data
    window.open(`${GITHUB_ISSUES_URL}?title=${issueTitle}&body=${issueBody}`, "_blank");
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout 
      title="Report an Error" 
      description="Help us improve by reporting bugs and issues"
      requireAuth={true}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-muted-foreground">
            Found a bug or issue? Let us know so we can improve MPA for everyone.
          </p>
          
          <Button 
            variant="outline"
            className="gap-2 hover:bg-[#24292e] hover:text-white transition-colors"
            onClick={handleGitHubRedirect}
          >
            <Github className="h-4 w-4" />
            Report on GitHub
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        {remainingReports <= 0 ? (
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                Daily Report Limit Reached
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                You've reached the maximum number of error reports for today. 
                Please try again tomorrow or use GitHub to report this issue directly.
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleGitHubRedirect}
              >
                <Github className="mr-2 h-4 w-4" />
                Continue on GitHub
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Report an Issue
              </CardTitle>
              <CardDescription>
                You have {remainingReports} report {remainingReports === 1 ? 'submission' : 'submissions'} remaining today
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Briefly describe the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about what happened"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="steps">Steps to Reproduce</Label>
                  <Textarea
                    id="steps"
                    placeholder="What were you doing when the issue occurred? List the steps."
                    rows={3}
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </motion.div>
    </PageLayout>
  );
};

export default ErrorReport;
