
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { ServiceManagement } from "@/components/admin/ServiceManagement";
import { PaymentVerification } from "@/components/admin/PaymentVerification";
import { RoleRequests } from "@/components/admin/RoleRequests";
import { AdminControls } from "@/components/admin/AdminControls";
import { AdminSetup } from "@/components/admin/AdminSetup";
import { PostsManagement } from "@/components/admin/PostsManagement";
import { WidgetsManagement } from "@/components/admin/WidgetsManagement";
import { 
  Database, 
  FileText, 
  BarChart3, 
  UserCog, 
  CreditCard, 
  Users, 
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  CircleDashed,
  MessageSquare,
  Edit,
  Trash2,
  List,
  FileEdit,
  Layers,
  Loader2
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Define the proper type for the error report stats response
interface ErrorReportStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

interface ErrorReport {
  id: string;
  error_type: string;
  title: string | null;
  description: string;
  status: string;
  created_at: string;
  contact_email: string | null;
  user_id: string | null;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Query to fetch error report statistics
  const { data: errorReportStats, refetch: refetchStats } = useQuery({
    queryKey: ["error-report-stats"],
    queryFn: async () => {
      try {
        const response = await supabase.rpc("get_error_report_stats");
        if (response.error) throw response.error;
        return response.data as ErrorReportStats;
      } catch (err) {
        console.error("Failed to fetch error report stats:", err);
        return { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 } as ErrorReportStats;
      }
    },
    enabled: !!isAdmin
  });

  // Query to fetch error reports
  const { data: errorReports, refetch: refetchReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["error-reports"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("error_reports")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        return data as ErrorReport[];
      } catch (err) {
        console.error("Failed to fetch error reports:", err);
        return [] as ErrorReport[];
      }
    },
    enabled: !!isAdmin && activeTab === "reports"
  });

  // Update error report status
  const updateReportStatus = async (id: string, status: string) => {
    if (!selectedReport) return;
    
    setUpdatingStatus(true);
    try {
      const updateData: any = { 
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null
      };
      
      if (status === 'resolved' && resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from("error_reports")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success(`Report status updated to ${status}`);
      setDetailsOpen(false);
      setSelectedReport(null);
      refetchReports();
      refetchStats();
    } catch (err: any) {
      toast.error(`Failed to update report status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from("error_reports")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Report deleted successfully");
      if (detailsOpen) {
        setDetailsOpen(false);
        setSelectedReport(null);
      }
      refetchReports();
      refetchStats();
    } catch (err: any) {
      toast.error(`Failed to delete report: ${err.message}`);
    }
  };

  const handleViewDetails = (report: ErrorReport) => {
    setSelectedReport(report);
    setResolutionNotes("");
    setDetailsOpen(true);
  };

  useEffect(() => {
    if (!isAdmin && !isAdminLoading) {
      toast.error("You are not authorized to view this page.");
      navigate("/");
    }
  }, [isAdmin, isAdminLoading, navigate]);

  if (isAdminLoading) {
    return <LoadingSpinner />;
  }

  // Function to get the status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <PageLayout
      title="Admin Panel"
      description="Manage users, services, payments, and system settings"
      requireAuth={true}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="services">
            <Database className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="roles">
            <UserCog className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="posts">
            <FileEdit className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Posts</span>
          </TabsTrigger>
          <TabsTrigger value="widgets">
            <Layers className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Widgets</span>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminControls />
        </TabsContent>

        <TabsContent value="services">
          <ServiceManagement />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentVerification />
        </TabsContent>

        <TabsContent value="roles">
          <RoleRequests />
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-green-200 dark:border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Resolved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorReportStats?.resolved || 0}</div>
                <p className="text-xs text-muted-foreground">Issues fixed</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-yellow-200 dark:border-yellow-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorReportStats?.in_progress || 0}</div>
                <p className="text-xs text-muted-foreground">Being investigated</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-red-200 dark:border-red-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorReportStats?.rejected || 0}</div>
                <p className="text-xs text-muted-foreground">Cannot reproduce</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CircleDashed className="h-4 w-4 text-gray-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorReportStats?.pending || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Error Reports</CardTitle>
              <CardDescription>Manage and respond to user-submitted error reports</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="min-w-[200px]">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorReports && errorReports.length > 0 ? (
                        errorReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.error_type}</TableCell>
                            <TableCell>
                              {report.title || report.description.substring(0, 30) + "..."}
                            </TableCell>
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                            <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <List className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => updateReportStatus(report.id, "in_progress")}
                                    className="text-yellow-600"
                                  >
                                    <Clock className="mr-2 h-4 w-4" /> Mark In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setSelectedReport(report) || setDetailsOpen(true)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateReportStatus(report.id, "rejected")}
                                    className="text-red-600"
                                  >
                                    <AlertCircle className="mr-2 h-4 w-4" /> Reject Report
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteReport(report.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No error reports found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <PostsManagement />
        </TabsContent>

        <TabsContent value="widgets">
          <WidgetsManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Track user activity over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={[
                  { name: 'Jan', value: 4000 },
                  { name: 'Feb', value: 3000 },
                  { name: 'Mar', value: 2000 },
                  { name: 'Apr', value: 2780 },
                  { name: 'May', value: 1890 },
                  { name: 'Jun', value: 2390 },
                  { name: 'Jul', value: 3490 },
                ]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>See the distribution of user roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart data={[
                  { name: 'Admin', value: 30 },
                  { name: 'User', value: 400 },
                  { name: 'Moderator', value: 50 },
                ]} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Error Report Trends</CardTitle>
                <CardDescription>Analyze error report submissions over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={[
                  { name: 'Jan', value: 20 },
                  { name: 'Feb', value: 30 },
                  { name: 'Mar', value: 40 },
                  { name: 'Apr', value: 20 },
                  { name: 'May', value: 35 },
                  { name: 'Jun', value: 40 },
                  { name: 'Jul', value: 50 },
                ]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <AdminSetup />
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Error Report Details</DialogTitle>
            <DialogDescription>
              Report submitted on {selectedReport && new Date(selectedReport.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p className="text-sm">{selectedReport.error_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p className="text-sm">{getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Title</h3>
                <p className="text-sm">{selectedReport.title || "No title provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Contact Email</h3>
                <p className="text-sm">{selectedReport.contact_email || "No email provided"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Resolution Notes</h3>
                <Textarea
                  placeholder="Add notes about how this issue was resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDetailsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteReport(selectedReport.id)}
                >
                  Delete
                </Button>
                <Button 
                  variant="default"
                  onClick={() => updateReportStatus(selectedReport.id, "resolved")}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default AdminPanel;
