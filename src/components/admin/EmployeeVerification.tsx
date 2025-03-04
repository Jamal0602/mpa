
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export const EmployeeVerification = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("job_applications")
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url,
              full_name
            )
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load pending applications");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingApplications();
    
    // Set up subscription
    const channel = supabase
      .channel("admin-applications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_applications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Add new application to the list
            setApplications((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            // Update application in the list
            setApplications((prev) =>
              prev.map((app) => (app.id === payload.new.id ? payload.new : app))
            );
          } else if (payload.eventType === "DELETE") {
            // Remove application from the list
            setApplications((prev) =>
              prev.filter((app) => app.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleApprove = async (id: string) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          status: "approved",
          feedback: feedback || "Your application has been approved. Welcome to the team!",
        })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      // Get the application to get the user_id
      const { data: application, error: appError } = await supabase
        .from("job_applications")
        .select("user_id, position")
        .eq("id", id)
        .single();
        
      if (appError) throw appError;
      
      // Update user role in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "employee" })
        .eq("id", application.user_id);
        
      if (profileError) throw profileError;
      
      // Create notification for the user
      await supabase
        .from("notifications")
        .insert({
          user_id: application.user_id,
          title: "Application Approved",
          message: `Congratulations! Your application for the ${application.position} position has been approved. Welcome to the team!`,
          type: "success"
        });
        
      toast.success("Employee approved successfully");
      
      // Remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setSelectedApplication(null);
      setFeedback("");
    } catch (error) {
      console.error("Error approving employee:", error);
      toast.error("Failed to approve employee");
    }
  };
  
  const handleReject = async (id: string) => {
    if (!feedback) {
      toast.error("Please provide feedback for rejection");
      return;
    }
    
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          status: "rejected",
          feedback: feedback,
        })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      // Get the application to get the user_id
      const { data: application, error: appError } = await supabase
        .from("job_applications")
        .select("user_id, position")
        .eq("id", id)
        .single();
        
      if (appError) throw appError;
      
      // Create notification for the user
      await supabase
        .from("notifications")
        .insert({
          user_id: application.user_id,
          title: "Application Not Approved",
          message: `We regret to inform you that your application for the ${application.position} position was not approved at this time.`,
          type: "warning"
        });
        
      toast.success("Application rejected");
      
      // Remove from local state
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setSelectedApplication(null);
      setFeedback("");
      setRejectDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Verification</CardTitle>
        <CardDescription>
          Review and verify employee applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No pending applications to review.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.profiles?.full_name || application.full_name}
                  </TableCell>
                  <TableCell>{application.position}</TableCell>
                  <TableCell>
                    {new Date(application.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setFeedback("");
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="sm:max-w-md">
                          {selectedApplication && (
                            <>
                              <SheetHeader>
                                <SheetTitle>Application Details</SheetTitle>
                                <SheetDescription>
                                  Review the candidate's information
                                </SheetDescription>
                              </SheetHeader>
                              <div className="py-4 space-y-4">
                                <div>
                                  <h3 className="font-medium">Full Name</h3>
                                  <p>
                                    {selectedApplication.profiles?.full_name || 
                                     selectedApplication.full_name}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Email</h3>
                                  <p>{selectedApplication.email}</p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Position</h3>
                                  <p>{selectedApplication.position}</p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Age</h3>
                                  <p>{selectedApplication.age}</p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Location</h3>
                                  <p>{selectedApplication.location}</p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Experience</h3>
                                  <p className="whitespace-pre-wrap">
                                    {selectedApplication.experience}
                                  </p>
                                </div>
                                {selectedApplication.portfolio && (
                                  <div>
                                    <h3 className="font-medium">Portfolio</h3>
                                    <a
                                      href={selectedApplication.portfolio}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      View Portfolio
                                    </a>
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-medium">Additional Information</h3>
                                  <p className="whitespace-pre-wrap">
                                    {selectedApplication.message}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Feedback (Optional)</h3>
                                  <Textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide feedback for the applicant"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <SheetFooter className="pt-4">
                                <div className="flex space-x-2 w-full">
                                  <Button
                                    variant="default"
                                    className="w-1/2"
                                    onClick={() => handleApprove(selectedApplication.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        className="w-1/2"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Confirm Rejection</DialogTitle>
                                        <DialogDescription>
                                          Please provide feedback before rejecting the application.
                                          This will be sent to the applicant.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="py-4">
                                        <Textarea
                                          value={feedback}
                                          onChange={(e) => setFeedback(e.target.value)}
                                          placeholder="Required feedback for rejection"
                                          className="mt-1"
                                          required
                                        />
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setRejectDialogOpen(false)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleReject(selectedApplication.id)}
                                          disabled={!feedback}
                                        >
                                          Confirm Rejection
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </SheetFooter>
                            </>
                          )}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
