
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

export const EmployeeStatus = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchApplicationStatus = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== "PGRST116") {
          throw error;
        }
        
        setApplication(data || null);
      } catch (error) {
        console.error("Error fetching application status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationStatus();
    
    // Set up subscription
    const channel = supabase
      .channel("employee-status-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_applications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setApplication(payload.new);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "pending":
      default:
        return "warning";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (!application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employment Status</CardTitle>
          <CardDescription>
            You haven't applied for any positions yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = "/work-with-us"}>
            Apply Now
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Status</CardTitle>
        <CardDescription>
          Track your application status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="font-medium">Position:</div>
          <div>{application.position}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="font-medium">Status:</div>
          <div className="flex items-center gap-2">
            {getStatusIcon(application.status)}
            <Badge variant={getStatusColor(application.status) as any}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="font-medium">Application Date:</div>
          <div>{new Date(application.created_at).toLocaleDateString()}</div>
        </div>
        
        {application.feedback && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="font-medium mb-1">Feedback:</div>
            <div className="text-sm">{application.feedback}</div>
          </div>
        )}
        
        {application.status === "approved" && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-md">
            <div className="font-medium mb-1 text-green-700 dark:text-green-300">
              Congratulations!
            </div>
            <div className="text-sm">
              Your application has been approved. You are now a part of our team.
              Check your notifications for further instructions.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
