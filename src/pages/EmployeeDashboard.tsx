
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, DollarSign, ExternalLink, FileText, Hourglass, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  category: string;
  file_url: string;
  price: number;
  owner: {
    email: string;
    username: string;
  };
  created_at: string;
}

interface Payment {
  id: string;
  project_id: string;
  amount: number;
  percentage: number;
  status: string;
  transaction_id: string;
  created_at: string;
  project: {
    title: string;
  };
}

interface EmployeeMetrics {
  measured_points: number;
  total_completed_projects: number;
  total_cancelled_projects: number;
  pending_payout: number;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [metrics, setMetrics] = useState<EmployeeMetrics | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [completionUrl, setCompletionUrl] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const checkEmployeeStatus = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Check if user is an employee
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.role !== "employee" && profile.role !== "admin") {
          toast.error("You don't have access to the employee dashboard");
          navigate("/");
          return;
        }

        // Load employee metrics
        loadEmployeeMetrics();
        
        // Load assigned projects
        loadAssignedProjects();
        
        // Load completed projects
        loadCompletedProjects();
        
        // Load payment history
        loadPayments();
      } catch (error) {
        console.error("Error checking employee status:", error);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    checkEmployeeStatus();
  }, [user, navigate]);

  const loadEmployeeMetrics = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("employee_metrics")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setMetrics(data);
      } else {
        // Create metrics record if it doesn't exist
        const { data: newMetrics, error: insertError } = await supabase
          .from("employee_metrics")
          .insert({ user_id: user.id })
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        setMetrics(newMetrics);
      }
    } catch (error) {
      console.error("Error loading employee metrics:", error);
    }
  };

  const loadAssignedProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id, title, description, status, deadline, category, file_url, price, created_at,
          owner:owner_id (
            email:email,
            username:username
          )
        `)
        .eq("assigned_to", user.id)
        .eq("status", "assigned")
        .order("deadline", { ascending: true });
        
      if (error) throw error;
      
      setAssignedProjects(data || []);
    } catch (error) {
      console.error("Error loading assigned projects:", error);
      toast.error("Failed to load assigned projects");
    }
  };

  const loadCompletedProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id, title, description, status, deadline, category, file_url, price, created_at,
          owner:owner_id (
            email:email,
            username:username
          )
        `)
        .eq("assigned_to", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });
        
      if (error) throw error;
      
      setCompletedProjects(data || []);
    } catch (error) {
      console.error("Error loading completed projects:", error);
      toast.error("Failed to load completed projects");
    }
  };

  const loadPayments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("project_payments")
        .select(`
          id, project_id, amount, percentage, status, transaction_id, created_at,
          project:project_id (
            title
          )
        `)
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setPayments(data || []);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Failed to load payment history");
    }
  };

  const handleCompleteProject = async () => {
    if (!selectedProject || !completionUrl) {
      toast.error("Please provide a completion URL");
      return;
    }
    
    setProcessingAction(true);
    
    try {
      // Update project status
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          download_url: completionUrl,
          completion_notes: completionNotes
        })
        .eq("id", selectedProject.id);
        
      if (updateError) throw updateError;
      
      // Calculate payment based on measured points
      const mpPercentage = metrics?.measured_points || 80;
      const paymentAmount = (selectedProject.price * mpPercentage) / 100;
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from("project_payments")
        .insert({
          project_id: selectedProject.id,
          employee_id: user?.id,
          amount: paymentAmount,
          percentage: mpPercentage,
          status: "pending"
        });
        
      if (paymentError) throw paymentError;
      
      // Update employee metrics
      const { error: metricsError } = await supabase
        .from("employee_metrics")
        .update({
          total_completed_projects: (metrics?.total_completed_projects || 0) + 1,
          pending_payout: (metrics?.pending_payout || 0) + paymentAmount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user?.id);
        
      if (metricsError) throw metricsError;
      
      // Send notification to owner
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedProject.owner.email,
          title: "Project Completed",
          message: `Your project "${selectedProject.title}" has been completed. You can download the result now.`,
          type: "success"
        });
        
      if (notificationError) console.error("Notification error:", notificationError);
      
      toast.success("Project marked as completed successfully");
      
      // Refresh data
      loadAssignedProjects();
      loadCompletedProjects();
      loadPayments();
      loadEmployeeMetrics();
      
      // Reset form and close dialog
      setCompletionUrl("");
      setCompletionNotes("");
      setSelectedProject(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error completing project:", error);
      toast.error(`Failed to complete project: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelProject = async () => {
    if (!selectedProject) return;
    
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    
    setProcessingAction(true);
    
    try {
      // Update project status
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          status: "cancelled",
          cancellation_reason: cancelReason,
          cancelled_at: new Date().toISOString()
        })
        .eq("id", selectedProject.id);
        
      if (updateError) throw updateError;
      
      // Deduct measured points
      const newMeasuredPoints = Math.max(0, (metrics?.measured_points || 80) - 3);
      
      // Update employee metrics
      const { error: metricsError } = await supabase
        .from("employee_metrics")
        .update({
          measured_points: newMeasuredPoints,
          total_cancelled_projects: (metrics?.total_cancelled_projects || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user?.id);
        
      if (metricsError) throw metricsError;
      
      // Deduct user spark points
      const { error: pointsError } = await supabase.rpc("deduct_key_points", {
        user_id: user?.id,
        amount: 10,
        description: `Penalty for cancelling project: ${selectedProject.title}`
      });
      
      if (pointsError) console.error("Points deduction error:", pointsError);
      
      // Send notification to owner
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedProject.owner.email,
          title: "Project Cancelled",
          message: `Your project "${selectedProject.title}" has been cancelled. Reason: ${cancelReason}`,
          type: "error"
        });
        
      if (notificationError) console.error("Notification error:", notificationError);
      
      toast.success("Project cancelled. Note: 10 Spark Points and 3 MP have been deducted.");
      
      // Refresh data
      loadAssignedProjects();
      loadEmployeeMetrics();
      
      // Reset form and close dialog
      setCancelReason("");
      setSelectedProject(null);
      setIsCancelDialogOpen(false);
    } catch (error: any) {
      console.error("Error cancelling project:", error);
      toast.error(`Failed to cancel project: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageLayout
      title="Employee Dashboard"
      description="Manage your assigned projects and track your performance"
      requireAuth={true}
    >
      <div className="space-y-6">
        {/* Employee Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Measured Points</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">{metrics?.measured_points || 0}</h3>
                    <span className="ml-2 text-xs">/90</span>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                  ${(metrics?.measured_points || 0) >= 80 ? 'bg-green-100 text-green-600' : 
                    (metrics?.measured_points || 0) >= 60 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-red-100 text-red-600'}`}
                >
                  {(metrics?.measured_points || 0) >= 80 ? '😃' : 
                   (metrics?.measured_points || 0) >= 60 ? '😐' : '😟'}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Projects</p>
                  <h3 className="text-2xl font-bold">{metrics?.total_completed_projects || 0}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancelled Projects</p>
                  <h3 className="text-2xl font-bold">{metrics?.total_cancelled_projects || 0}</h3>
                </div>
                <X className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
                  <h3 className="text-2xl font-bold">${metrics?.pending_payout?.toFixed(2) || "0.00"}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Projects and Payments */}
        <Tabs defaultValue="assigned">
          <TabsList className="mb-4">
            <TabsTrigger value="assigned" className="relative">
              Assigned Projects
              {assignedProjects.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">{assignedProjects.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned" className="space-y-4">
            {assignedProjects.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Hourglass className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-medium">No Assigned Projects</h3>
                  <p className="text-muted-foreground mt-1">
                    You don't have any assigned projects at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              assignedProjects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className={`h-2 ${new Date(project.deadline) < new Date() ? 'bg-red-500' : 'bg-primary'}`} />
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription>
                            {project.owner?.username || project.owner?.email}
                          </CardDescription>
                        </div>
                        <Badge variant={new Date(project.deadline) < new Date() ? "destructive" : "secondary"}>
                          {new Date(project.deadline) < new Date() ? (
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" /> Overdue
                            </span>
                          ) : (
                            project.category
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description || "No description provided"}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>
                            Due: {format(new Date(project.deadline), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="font-medium">${project.price.toFixed(2)}</div>
                      </div>
                      
                      {project.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full text-xs"
                          onClick={() => window.open(project.file_url, "_blank")}
                        >
                          <FileText className="mr-1 h-3 w-3" /> View Source Files
                        </Button>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setSelectedProject(project);
                          setIsCancelDialogOpen(true);
                        }}
                      >
                        <X className="mr-1 h-4 w-4" /> Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Complete
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedProjects.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-medium">No Completed Projects</h3>
                  <p className="text-muted-foreground mt-1">
                    You haven't completed any projects yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedProjects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription>
                            {project.owner?.username || project.owner?.email}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {project.description || "No description provided"}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm mt-4">
                        <div className="text-muted-foreground">Category: {project.category || "General"}</div>
                        <div className="font-medium">${project.price.toFixed(2)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="payments">
            {payments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-medium">No Payment History</h3>
                  <p className="text-muted-foreground mt-1">
                    You don't have any payment records yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <motion.div 
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{payment.project?.title || "Unknown Project"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="mr-4 text-right">
                              <p className="font-bold">${payment.amount.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{payment.percentage}% of project</p>
                            </div>
                            
                            <Badge 
                              variant={
                                payment.status === "paid" ? "outline" : 
                                payment.status === "pending" ? "secondary" : "default"
                              }
                              className={payment.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}
                            >
                              {payment.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        
                        {payment.transaction_id && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Transaction ID: {payment.transaction_id}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Complete Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Project</DialogTitle>
            <DialogDescription>
              Enter the download URL for the completed project files.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completionUrl">Download URL *</Label>
              <Input
                id="completionUrl"
                value={completionUrl}
                onChange={(e) => setCompletionUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Provide a link where the client can download the completed project.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completionNotes">Completion Notes</Label>
              <Textarea
                id="completionNotes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about the completed project..."
                rows={3}
              />
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm space-y-2">
              <p className="font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-primary" />
                Payment Information
              </p>
              <p>Your Measured Points: <span className="font-bold">{metrics?.measured_points || 80}</span>/90</p>
              <p>
                Expected Payment: <span className="font-bold">
                  ${selectedProject ? ((selectedProject.price * (metrics?.measured_points || 80)) / 100).toFixed(2) : "0.00"}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({metrics?.measured_points || 80}% of ${selectedProject?.price.toFixed(2) || "0.00"})
                </span>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={processingAction}>
              Cancel
            </Button>
            <Button onClick={handleCompleteProject} disabled={!completionUrl || processingAction}>
              {processingAction ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Project Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Cancel Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this project? This will deduct 10 Spark Points and 3 MP.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for Cancellation *</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Explain why you need to cancel this project..."
                rows={3}
                required
              />
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm space-y-2 text-red-600 dark:text-red-300">
              <p className="font-medium">Penalties for cancellation:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>-10 Spark Points will be deducted</li>
                <li>-3 Measured Points will be deducted</li>
                <li>Your cancellation count will increase</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={processingAction}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={handleCancelProject} disabled={!cancelReason || processingAction}>
              {processingAction ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                "Cancel Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default EmployeeDashboard;
