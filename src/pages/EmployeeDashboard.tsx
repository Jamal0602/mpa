
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { LoadingSpinner } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, CheckCircle, XCircle, Clock, DollarSign, 
  Package, FileText, AlertTriangle, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { format } from "date-fns";

// Define types
interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  category: string;
  file_url: string;
  price: number;
  created_at: string;
  owner: {
    email: string;
    username: string;
  };
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
  id: string;
  user_id: string;
  measured_points: number;
  total_completed: number;
  total_cancelled: number;
  total_earnings: number;
}

const statusColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [metrics, setMetrics] = useState<EmployeeMetrics | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [action, setAction] = useState<"complete" | "cancel" | null>(null);
  const [completionUrl, setCompletionUrl] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchEmployeeAccess = async () => {
      try {
        const { data: employeeData, error: employeeError } = await supabase
          .from("employee_access")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (employeeError || !employeeData) {
          navigate("/");
          toast.error("You don't have employee access");
          return;
        }

        fetchData();
      } catch (error) {
        console.error("Error checking employee access:", error);
        navigate("/");
      }
    };

    fetchEmployeeAccess();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assigned projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          id, title, description, status, deadline, category, 
          file_url, price, created_at, 
          owner:owner_id(email, username)
        `)
        .eq("assigned_to", user?.id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Transform the data to match our Project interface
      const transformedProjects = projectsData.map(project => ({
        ...project,
        owner: Array.isArray(project.owner) 
          ? { email: project.owner[0]?.email || "", username: project.owner[0]?.username || "" }
          : project.owner as { email: string; username: string }
      }));

      setProjects(transformedProjects);
      setFilteredProjects(transformedProjects);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("project_payments")
        .select(`
          id, project_id, amount, percentage, status, 
          transaction_id, created_at,
          project:project_id(title)
        `)
        .eq("employee_id", user?.id)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Transform the data to match our Payment interface
      const transformedPayments = paymentsData.map(payment => ({
        ...payment,
        project: Array.isArray(payment.project)
          ? { title: payment.project[0]?.title || "" }
          : payment.project as { title: string }
      }));

      setPayments(transformedPayments);

      // Fetch employee metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("employee_metrics")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (metricsError && metricsError.code !== "PGRST116") {
        // PGRST116 is "No rows returned" - this is fine for new employees
        throw metricsError;
      }

      setMetrics(metricsData || {
        id: "",
        user_id: user?.id || "",
        measured_points: 80, // Default MP
        total_completed: 0,
        total_cancelled: 0,
        total_earnings: 0
      });

    } catch (error: any) {
      console.error("Error fetching employee data:", error);
      toast.error(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    
    if (status === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.status === status));
    }
  };

  const handleActionClick = (project: Project, actionType: "complete" | "cancel") => {
    setSelectedProject(project);
    setAction(actionType);
    setConfirmDialogOpen(true);
    
    if (actionType === "complete") {
      setCompletionUrl("");
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedProject || !action) return;
    
    try {
      setLoading(true);
      
      if (action === "complete") {
        if (!completionUrl.trim()) {
          toast.error("Please provide a valid completion URL");
          setLoading(false);
          return;
        }
        
        // Update project status to completed
        const { error: projectError } = await supabase
          .from("projects")
          .update({ 
            status: "completed",
            completion_url: completionUrl
          })
          .eq("id", selectedProject.id);
          
        if (projectError) throw projectError;
        
        // Create notification for owner
        await supabase.from("notifications").insert({
          user_id: selectedProject.owner.email ? 
            (await supabase.from("profiles").select("id").eq("email", selectedProject.owner.email).single()).data?.id : 
            (await supabase.from("profiles").select("id").eq("username", selectedProject.owner.username).single()).data?.id,
          title: "Project Completed",
          message: `Your project "${selectedProject.title}" has been completed! You can download the files now.`,
          type: "success"
        });
        
        // Calculate payment based on measured points
        const mpPercentage = (metrics?.measured_points || 80) / 100;
        const paymentAmount = selectedProject.price * mpPercentage;
        
        // Create payment request
        await supabase.from("project_payments").insert({
          project_id: selectedProject.id,
          employee_id: user?.id,
          amount: paymentAmount,
          percentage: mpPercentage * 100,
          status: "pending"
        });
        
        toast.success("Project marked as completed and payment request created");
      } else if (action === "cancel") {
        // Update project status to cancelled
        const { error: projectError } = await supabase
          .from("projects")
          .update({ status: "cancelled" })
          .eq("id", selectedProject.id);
          
        if (projectError) throw projectError;
        
        // Create notification for owner
        await supabase.from("notifications").insert({
          user_id: selectedProject.owner.email ? 
            (await supabase.from("profiles").select("id").eq("email", selectedProject.owner.email).single()).data?.id : 
            (await supabase.from("profiles").select("id").eq("username", selectedProject.owner.username).single()).data?.id,
          title: "Project Cancelled",
          message: `Unfortunately, your project "${selectedProject.title}" has been cancelled by the assigned employee.`,
          type: "warning"
        });
        
        // Update employee metrics - deduct points
        if (metrics) {
          const updatedMP = Math.max(0, (metrics.measured_points || 80) - 3);
          
          await supabase.from("employee_metrics").upsert({
            id: metrics.id || undefined,
            user_id: user?.id,
            measured_points: updatedMP,
            total_cancelled: (metrics.total_cancelled || 0) + 1
          });
          
          // Deduct Spark Points too
          await supabase.from("profiles")
            .update({ key_points: supabase.rpc('decrement_points', { amount: 10 }) })
            .eq("id", user?.id);
            
          await supabase.from("key_points_transactions").insert({
            user_id: user?.id,
            amount: -10,
            description: `Deduction for cancelling project "${selectedProject.title}"`,
            transaction_type: "spend"
          });
        }
        
        toast.success("Project cancelled and MP reduced");
      }
      
      // Refresh data
      fetchData();
      
    } catch (error: any) {
      console.error(`Error ${action}ing project:`, error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setSelectedProject(null);
      setAction(null);
      setCompletionUrl("");
    }
  };

  if (loading && (!projects.length && !payments.length)) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout
      title="Employee Dashboard"
      description="Manage assigned projects and view payment history"
      requireAuth={true}
    >
      <div className="space-y-8">
        {/* Employee metrics */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics?.measured_points || 80}/90
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Measured Points (MP)</div>
                <Progress 
                  value={((metrics?.measured_points || 80) / 90) * 100} 
                  className="h-2 mt-2 w-full" 
                />
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics?.total_completed || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed Projects</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {metrics?.total_cancelled || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Cancelled Projects</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  ${metrics?.total_earnings?.toFixed(2) || "0.00"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Assigned Projects</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => handleFilterChange("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => handleFilterChange("pending")}
                >
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "processing" ? "default" : "outline"}
                  onClick={() => handleFilterChange("processing")}
                >
                  Processing
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => handleFilterChange("completed")}
                >
                  Completed
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "cancelled" ? "default" : "outline"}
                  onClick={() => handleFilterChange("cancelled")}
                >
                  Cancelled
                </Button>
              </div>
              
              <Button onClick={fetchData} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
            
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No projects found</p>
                  <p className="text-sm text-muted-foreground">
                    {statusFilter === "all" 
                      ? "You don't have any assigned projects yet." 
                      : `You don't have any ${statusFilter} projects.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{project.title}</CardTitle>
                            <CardDescription>{project.category}</CardDescription>
                          </div>
                          <Badge
                            className={`${
                              statusColors[project.status as keyof typeof statusColors] || "bg-gray-500"
                            } text-white`}
                          >
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Description:</p>
                            <p className="text-sm">{project.description || "No description provided"}</p>
                            
                            <div className="flex items-center mt-4 gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Deadline: {project.deadline ? format(new Date(project.deadline), "PPP") : "Not specified"}
                              </span>
                            </div>
                            
                            <div className="flex items-center mt-2 gap-1 text-sm text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              <span>Price: ${project.price?.toFixed(2) || "0.00"}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Client:</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {project.owner?.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{project.owner?.username || "Unknown User"}</p>
                                <p className="text-xs text-muted-foreground">{project.owner?.email || ""}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center mt-4 gap-1 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <a 
                                href={project.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Project Files
                              </a>
                            </div>
                            
                            <div className="flex items-center mt-2 gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Created: {format(new Date(project.created_at), "PPP")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      {(project.status === "pending" || project.status === "processing") && (
                        <CardFooter className="flex justify-end gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleActionClick(project, "cancel")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Project
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleActionClick(project, "complete")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Complete
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View all your payment records and pending requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No payment records</p>
                    <p className="text-sm text-muted-foreground">
                      Your payment history will appear here after completing projects
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div 
                        key={payment.id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-4 rounded-lg hover:bg-secondary/10 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium">{payment.project?.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={payment.status === "completed" ? "success" : "outline"}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(payment.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          {payment.status === "completed" && payment.transaction_id && (
                            <p className="text-xs text-muted-foreground mt-1">
                              TXN: {payment.transaction_id}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-2 sm:mt-0 flex flex-col items-end">
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ${payment.amount?.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {payment.percentage}% of project value
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {action === "complete" ? "Complete Project" : "Cancel Project"}
              </DialogTitle>
              <DialogDescription>
                {action === "complete"
                  ? "Are you sure you want to mark this project as complete? Your MP will determine the payment amount."
                  : "Are you sure you want to cancel this project? This will reduce your MP by 3 points and deduct 10 Spark Points."}
              </DialogDescription>
            </DialogHeader>
            
            {action === "complete" && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="completionUrl">Project Completion URL</Label>
                  <Input
                    id="completionUrl"
                    placeholder="Enter the URL where the completed files can be accessed"
                    value={completionUrl}
                    onChange={(e) => setCompletionUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    This URL will be shared with the client to download the completed project
                  </p>
                </div>
                
                <div className="flex items-center p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                  <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-sm">
                    <p className="font-medium">Payment Information:</p>
                    <p>Your Measured Points: {metrics?.measured_points || 80}/90</p>
                    <p>Payment Percentage: {(metrics?.measured_points || 80)}%</p>
                    <p>Estimated Payment: ${selectedProject ? ((selectedProject.price * (metrics?.measured_points || 80)) / 100).toFixed(2) : "0.00"}</p>
                  </div>
                </div>
              </div>
            )}
            
            {action === "cancel" && (
              <div className="flex items-center p-3 border rounded-md bg-red-50 dark:bg-red-900/20 my-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div className="text-sm">
                  <p className="font-medium">Warning:</p>
                  <p>Cancelling this project will:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Reduce your MP by 3 points</li>
                    <li>Deduct 10 Spark Points</li>
                    <li>Notify the client of cancellation</li>
                  </ul>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAction}
                variant={action === "complete" ? "default" : "destructive"}
                disabled={action === "complete" && !completionUrl.trim()}
              >
                {action === "complete" ? "Complete Project" : "Cancel Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default EmployeeDashboard;
