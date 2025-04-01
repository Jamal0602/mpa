import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CustomBadge } from "@/components/ui/custom-badge";
import { BarChart, PieChart, LineChart } from "@/components/ui/chart";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronDown, 
  Download, 
  Users, 
  MoreHorizontal, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CircleDashed, 
  Database, 
  UserCog, 
  RefreshCw, 
  Trash2, 
  ShieldAlert, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Filter,
  Plus
} from "lucide-react";

// Define types for data structures
type UserProfile = {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string;
    role: string;
  };
};

type ErrorReport = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  steps_to_reproduce: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
};

type ErrorReportStats = {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [reportStatus, setReportStatus] = useState<'pending' | 'in_progress' | 'resolved' | 'rejected'>('pending');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  useEffect(() => {
    if (!isAdmin && !isAdminLoading) {
      toast.error("You are not authorized to view this page.");
      navigate("/");
    }
  }, [isAdmin, isAdminLoading, navigate]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        const userList: UserProfile[] = data.users.map(user => ({
          id: user.id,
          email: user.email || 'N/A',
          created_at: user.created_at,
          profile: {
            full_name: 'N/A',
            avatar_url: '',
            role: 'user',
          },
        }));

        // Fetch profile data for each user
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userList.map(user => user.id));

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Merge profile data into userList
        const updatedUserList: UserProfile[] = userList.map(user => {
          const profile = profiles?.find(p => p.id === user.id);
          return {
            ...user,
            profile: profile
              ? {
                  full_name: profile.full_name || 'N/A',
                  avatar_url: profile.avatar_url || '',
                  role: profile.role || 'user',
                }
              : {
                  full_name: 'N/A',
                  avatar_url: '',
                  role: 'user',
                },
          };
        });

        setUsers(updatedUserList);
      } catch (error: any) {
        toast.error(`Error fetching users: ${error.message}`);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Fetch error reports
  useEffect(() => {
    const fetchErrorReports = async () => {
      setLoadingReports(true);
      try {
        const { data, error } = await supabase
          .from("error_reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setErrorReports(data || []);
      } catch (error: any) {
        toast.error(`Error fetching error reports: ${error.message}`);
      } finally {
        setLoadingReports(false);
      }
    };

    if (isAdmin) {
      fetchErrorReports();
    }
  }, [isAdmin]);

  // Update the useQuery hook for error reports stats - fix the onSuccess issue
  const { data: errorReportStats, isLoading: loadingErrorStats, refetch: refetchErrorStats } = useQuery({
    queryKey: ["errorReportStats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_error_report_stats');
      if (error) throw error;
      return data;
    },
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error("Error fetching error report stats:", error);
        }
      }
    }
  });

  // Mutations for updating user role and deleting user
  const updateUserRoleMutation = useMutation(
    async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        toast.success("User role updated successfully");
        queryClient.invalidateQueries(["users"]); // Invalidate users query to refetch
      },
      onError: (error: any) => {
        toast.error(`Error updating user role: ${error.message}`);
      },
    }
  );

  const deleteUserMutation = useMutation(
    async (userId: string) => {
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        toast.success("User deleted successfully");
        queryClient.invalidateQueries(["users"]); // Invalidate users query to refetch
      },
      onError: (error: any) => {
        toast.error(`Error deleting user: ${error.message}`);
      },
    }
  );

  // Handler functions
  const handleRoleChange = async (userId: string, role: string) => {
    await updateUserRoleMutation.mutateAsync({ userId, role });
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleReportStatusChange = async (reportId: string, status: 'pending' | 'in_progress' | 'resolved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('error_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      // Optimistically update the state
      setErrorReports(currentReports =>
        currentReports.map(report =>
          report.id === reportId ? { ...report, status } : report
        )
      );

      toast.success('Report status updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update report status: ${error.message}`);
      // Revert the state in case of error
      setErrorReports(currentReports => {
        return currentReports.map(report => {
          if (report.id === reportId) {
            // Revert to the previous status
            return { ...report, status: errorReports.find(r => r.id === reportId)?.status || 'pending' };
          }
          return report;
        });
      });
    } finally {
      setSelectedReport(null);
    }
  };

  const filteredReports = errorReports.filter(report => {
    const searchTermLower = searchTerm.toLowerCase();
    const titleMatch = report.title.toLowerCase().includes(searchTermLower);
    const descriptionMatch = report.description.toLowerCase().includes(searchTermLower);
    const statusMatch = statusFilter === 'all' || report.status === statusFilter;
  
    return (titleMatch || descriptionMatch) && statusMatch;
  });

  const indexOfLastReport = page * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isAdminLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout title="Admin Panel" description="Manage users, error reports, and system settings" requireAuth={true}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="error-reports">
            <FileText className="mr-2 h-4 w-4" />
            Error Reports
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <UserCog className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and roles.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarImage src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                              <AvatarFallback>{user.profile?.full_name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.profile?.full_name || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.profile?.role || "user"}
                            onValueChange={(role) => handleRoleChange(user.id, role)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Role</SelectLabel>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => confirmDeleteUser(user.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Report Management</CardTitle>
              <CardDescription>Review and manage error reports submitted by users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <Card className="bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Resolved
                    </CardTitle>
                    <CardDescription>Total resolved reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorReportStats?.resolved || 0}</div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 dark:bg-yellow-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      In Progress
                    </CardTitle>
                    <CardDescription>Reports being investigated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorReportStats?.in_progress || 0}</div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Rejected
                    </CardTitle>
                    <CardDescription>Invalid or irreproducible reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorReportStats?.rejected || 0}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CircleDashed className="h-4 w-4 text-gray-500" />
                      Pending
                    </CardTitle>
                    <CardDescription>Reports awaiting review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorReportStats?.pending || 0}</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Error Reports</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => refetchErrorStats()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isFilterOpen && (
                <div className="mb-4 flex items-center space-x-4">
                  <Label htmlFor="status">Filter by Status:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {loadingReports ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reported At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.title}</TableCell>
                            <TableCell>
                              <CustomBadge variant={
                                report.status === 'pending' ? 'info' :
                                report.status === 'in_progress' ? 'warning' :
                                report.status === 'resolved' ? 'success' :
                                'destructive'
                              }>
                                {report.status}
                              </CustomBadge>
                            </TableCell>
                            <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(
                                    `${window.location.origin}/error-report/${report.id}`
                                  )}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Report Link
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {indexOfFirstReport + 1} - {Math.min(indexOfLastReport, filteredReports.length)} of {filteredReports.length} reports
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page * reportsPerPage >= filteredReports.length}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Visualize system usage and performance metrics.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch id="maintenanceMode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowSignups">Allow New Signups</Label>
                  <Switch id="allowSignups" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="systemDescription">System Description</Label>
                  <Textarea
                    id="systemDescription"
                    placeholder="Description of the system"
                    defaultValue="Multi Project Association (MPA) is a project management tool."
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Report Details Modal */}
      {selectedReport && (
        <AlertDialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error Report Details</AlertDialogTitle>
              <AlertDialogDescription>
                View details of the selected error report and manage its status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Report Title</h4>
                <p className="text-muted-foreground">{selectedReport.title}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Description</h4>
                <p className="text-muted-foreground">{selectedReport.description}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Steps to Reproduce</h4>
                <p className="text-muted-foreground">{selectedReport.steps_to_reproduce || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold">Status</h4>
                <Select
                  defaultValue={selectedReport.status}
                  onValueChange={(status) => setReportStatus(status as 'pending' | 'in_progress' | 'resolved' | 'rejected')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <AlertDialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (selectedReport) {
                    handleReportStatusChange(selectedReport.id, reportStatus);
                  }
                }}
              >
                Update Status
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </PageLayout>
  );
};

export default AdminPanel;
