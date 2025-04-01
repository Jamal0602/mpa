
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, CheckCircle, ShieldAlert, Trash2, UserCog, XCircle, Settings, FileText, Users, Bell, Upload, Briefcase, Database, Search, Eye, EyeOff, Edit, Save, RefreshCw, Loader2, Download, Filter, CheckSquare, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomBadge } from "@/components/ui/custom-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "blocked":
      return "destructive";
    default:
      return "secondary";
  }
};

// Function to get verification badge variant
const getVerificationBadgeVariant = (status: string) => {
  switch (status) {
    case "verified":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

// Main component
const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reportFilter, setReportFilter] = useState("all");
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    maintenance_mode: false,
    require_email_verification: true,
    allow_social_login: true,
    max_upload_size_mb: 10,
    default_user_role: "member",
    enable_analytics: true
  });
  
  const itemsPerPage = 10;

  // Fetch admin analytics data
  const { data: analytics, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_analytics');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch users with pagination and filtering
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', pageNumber, searchQuery, userStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });
      
      // Apply search filter
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      // Apply status filter
      if (userStatusFilter !== 'all') {
        query = query.eq('status', userStatusFilter);
      }
      
      // Apply pagination
      const from = (pageNumber - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        users: data,
        totalCount: count || 0
      };
    }
  });

  // Fetch error reports
  const { data: errorReports, isLoading: isLoadingReports, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports', reportFilter],
    queryFn: async () => {
      let query = supabase
        .from('error_reports')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `);
      
      // Apply status filter
      if (reportFilter !== 'all') {
        query = query.eq('status', reportFilter);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    }
  });

  // Fetch upload requests
  const { data: uploadRequests, isLoading: isLoadingUploads, refetch: refetchUploads } = useQuery({
    queryKey: ['admin-uploads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upload_requests')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return data;
    }
  });

  // Fetch job applications
  const { data: jobApplications, isLoading: isLoadingApplications, refetch: refetchApplications } = useQuery({
    queryKey: ['admin-job-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles:user_id (username, avatar_url, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return data;
    }
  });

  // Fetch system settings
  const { data: fetchedSettings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        maintenance_mode: false,
        require_email_verification: true,
        allow_social_login: true,
        max_upload_size_mb: 10,
        default_user_role: "member",
        enable_analytics: true
      };
    },
    onSuccess: (data) => {
      if (data) {
        setSystemSettings(data);
      }
    }
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update user role: ${error.message}`);
    }
  });

  // Update user status mutation
  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string, newStatus: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update user status: ${error.message}`);
    }
  });

  // Update error report status mutation
  const updateReportStatus = useMutation({
    mutationFn: async ({ reportId, newStatus, notes }: { reportId: string, newStatus: string, notes?: string }) => {
      const { error } = await supabase.rpc('update_error_report_status', {
        report_id: reportId,
        new_status: newStatus,
        resolution_notes: notes
      });
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Report status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update report status: ${error.message}`);
    }
  });

  // Update upload request status mutation
  const updateUploadStatus = useMutation({
    mutationFn: async ({ requestId, newStatus }: { requestId: string, newStatus: string }) => {
      const { error } = await supabase
        .from('upload_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-uploads'] });
      toast.success('Upload request updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update upload request: ${error.message}`);
    }
  });

  // Update job application status mutation
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ applicationId, newStatus }: { applicationId: string, newStatus: string }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-job-applications'] });
      toast.success('Application status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update application status: ${error.message}`);
    }
  });

  // Update system settings mutation
  const updateSystemSettings = useMutation({
    mutationFn: async (settings: typeof systemSettings) => {
      let { data: existingSettings } = await supabase
        .from('system_settings')
        .select('id')
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('system_settings')
          .update(settings)
          .eq('id', existingSettings.id);
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('system_settings')
          .insert([settings])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return result;
    },
    onSuccess: () => {
      setIsEditingSettings(false);
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('System settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update system settings: ${error.message}`);
    }
  });

  // Set up real-time subscription for updates
  useEffect(() => {
    const subscription = supabase
      .channel('admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        refetchUsers();
        refetchAnalytics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'error_reports' }, () => {
        refetchReports();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'upload_requests' }, () => {
        refetchUploads();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => {
        refetchApplications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchUsers, refetchAnalytics, refetchReports, refetchUploads, refetchApplications]);

  // Handle saving system settings
  const handleSaveSettings = () => {
    updateSystemSettings.mutate(systemSettings);
  };

  // Pagination controls
  const totalPages = usersData ? Math.ceil(usersData.totalCount / itemsPerPage) : 0;

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your application and users.</p>
        </div>
        <Button onClick={() => refetchAnalytics()} className="shrink-0">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            <span>Uploads</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.activeUsers || 0} active in the last 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Key Points Spent</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.recentOrders || 0} in the last 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employee Access</CardTitle>
                <UserCog className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total approved employees
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${systemSettings.maintenance_mode ? 'bg-destructive' : 'bg-green-500'}`}></div>
                  <div className="text-sm font-medium">
                    {systemSettings.maintenance_mode ? 'Maintenance Mode' : 'Operational'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {systemSettings.maintenance_mode 
                    ? 'System is in maintenance mode' 
                    : 'All systems operational'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Error Reports</CardTitle>
                <CardDescription>Latest issues reported by users</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="flex justify-center p-4">
                    <LoadingSpinner />
                  </div>
                ) : errorReports && errorReports.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {errorReports.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-start gap-4 p-3 border rounded-lg">
                          <div className={`h-2 w-2 rounded-full mt-2 ${
                            report.status === 'resolved' ? 'bg-green-500' : 
                            report.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium truncate">{report.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  By {report.profiles?.username || 'Anonymous'} • {format(new Date(report.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <CustomBadge variant={
                                report.status === 'resolved' ? 'success' : 
                                report.status === 'in_progress' ? 'warning' : 'destructive'
                              }>
                                {report.status.replace('_', ' ')}
                              </CustomBadge>
                            </div>
                            <p className="text-sm mt-1 truncate">{report.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No error reports found
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("reports")}>
                  View All Reports
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Latest content upload requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUploads ? (
                  <div className="flex justify-center p-4">
                    <LoadingSpinner />
                  </div>
                ) : uploadRequests && uploadRequests.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {uploadRequests.slice(0, 5).map((upload) => (
                        <div key={upload.id} className="flex items-start gap-4 p-3 border rounded-lg">
                          <div className={`h-2 w-2 rounded-full mt-2 ${
                            upload.status === 'approved' ? 'bg-green-500' : 
                            upload.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium truncate">{upload.file_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  By {upload.profiles?.username || 'Unknown'} • {format(new Date(upload.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <CustomBadge variant={
                                upload.status === 'approved' ? 'success' : 
                                upload.status === 'pending' ? 'warning' : 'destructive'
                              }>
                                {upload.status}
                              </CustomBadge>
                            </div>
                            <p className="text-sm mt-1">{(upload.file_size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No upload requests found
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("uploads")}>
                  View All Uploads
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-1 gap-2">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={userStatusFilter}
                onValueChange={setUserStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : usersData && usersData.users.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar_url || undefined} alt={user.username || "User"} />
                                <AvatarFallback>
                                  {user.username?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.username || "Anonymous"}</span>
                                <span className="text-xs text-muted-foreground">{user.username || user.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <CustomBadge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role || 'member'}
                            </CustomBadge>
                          </TableCell>
                          <TableCell>
                            <CustomBadge 
                              variant={getStatusBadgeVariant(user.status || 'pending')}
                            >
                              {user.status || 'pending'}
                            </CustomBadge>
                          </TableCell>
                          <TableCell>
                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/account?userId=${user.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateUserRole.mutate({ 
                                    userId: user.id, 
                                    newRole: user.role === 'admin' ? 'member' : 'admin' 
                                  })}
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Toggle Admin
                                </DropdownMenuItem>
                                {user.status !== 'blocked' ? (
                                  <DropdownMenuItem 
                                    onClick={() => updateUserStatus.mutate({ 
                                      userId: user.id, 
                                      newStatus: 'blocked' 
                                    })}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Block User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => updateUserStatus.mutate({ 
                                      userId: user.id, 
                                      newStatus: 'active' 
                                    })}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Unblock User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-center">
              {usersData && usersData.totalCount > 0 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                        disabled={pageNumber === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageToRender = (() => {
                        if (totalPages <= 5) return i + 1;
                        if (pageNumber <= 3) return i + 1;
                        if (pageNumber >= totalPages - 2) return totalPages - 4 + i;
                        return pageNumber - 2 + i;
                      })();
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setPageNumber(pageToRender)}
                            isActive={pageNumber === pageToRender}
                          >
                            {pageToRender}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && pageNumber < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                        disabled={pageNumber === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between gap-2">
            <Select
              value={reportFilter}
              onValueChange={setReportFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetchReports()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error Reports</CardTitle>
              <CardDescription>View and manage user-reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : errorReports && errorReports.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {errorReports.map((report) => (
                      <Card key={report.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <CustomBadge variant={
                                report.status === 'resolved' ? 'success' : 
                                report.status === 'in_progress' ? 'warning' : 'destructive'
                              }>
                                {report.status.replace('_', ' ')}
                              </CustomBadge>
                              <CardTitle className="text-lg">{report.title}</CardTitle>
                            </div>
                            <CustomBadge variant="outline">
                              {report.severity || 'medium'}
                            </CustomBadge>
                          </div>
                          <CardDescription>
                            Reported by {report.profiles?.username || 'Anonymous'} 
                            on {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm">{report.description}</p>
                            {report.resolution_notes && (
                              <div className="mt-4 p-3 bg-muted rounded-md">
                                <h4 className="text-sm font-medium">Resolution Notes:</h4>
                                <p className="text-sm">{report.resolution_notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          {report.status !== 'in_progress' && report.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              onClick={() => updateReportStatus.mutate({
                                reportId: report.id,
                                newStatus: 'in_progress'
                              })}
                            >
                              Start Working
                            </Button>
                          )}
                          {report.status !== 'resolved' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="default">
                                  <CheckSquare className="mr-2 h-4 w-4" />
                                  Mark as Resolved
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolve Issue</DialogTitle>
                                  <DialogDescription>
                                    Add resolution notes for this error report.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="notes">Resolution Notes</Label>
                                    <textarea
                                      id="notes"
                                      className="w-full min-h-[100px] p-2 border rounded-md"
                                      placeholder="Explain how the issue was resolved..."
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    onClick={() => {
                                      const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;
                                      updateReportStatus.mutate({
                                        reportId: report.id,
                                        newStatus: 'resolved',
                                        notes
                                      });
                                    }}
                                  >
                                    {updateReportStatus.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      'Save Resolution'
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No error reports found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uploads Tab */}
        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Upload Requests</CardTitle>
              <CardDescription>Review and approve user uploads</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUploads ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : uploadRequests && uploadRequests.length > 0 ? (
                <div className="space-y-4">
                  {uploadRequests.map((upload) => (
                    <Card key={upload.id}>
                      <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <CustomBadge variant={
                                upload.status === 'approved' ? 'success' : 
                                upload.status === 'pending' ? 'warning' : 'destructive'
                              }>
                                {upload.status}
                              </CustomBadge>
                              <CardTitle className="text-lg truncate">{upload.file_name}</CardTitle>
                            </div>
                            <CardDescription>
                              Uploaded by {upload.profiles?.username || 'Unknown'} 
                              on {format(new Date(upload.created_at), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <CustomBadge variant="outline">
                              {(upload.file_size / 1024 / 1024).toFixed(2)} MB
                            </CustomBadge>
                            <CustomBadge variant="outline">
                              {upload.file_type}
                            </CustomBadge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <p className="text-sm">{upload.description || 'No description provided'}</p>
                          </div>
                          <div className="shrink-0">
                            {upload.file_type.startsWith('image/') && upload.url && (
                              <div className="w-24 h-24 relative rounded-md overflow-hidden">
                                <img 
                                  src={upload.url} 
                                  alt={upload.file_name} 
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        {upload.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline"
                              onClick={() => updateUploadStatus.mutate({
                                requestId: upload.id,
                                newStatus: 'rejected'
                              })}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => updateUploadStatus.mutate({
                                requestId: upload.id,
                                newStatus: 'approved'
                              })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </>
                        )}
                        {upload.url && (
                          <Button variant="outline" asChild>
                            <a href={upload.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-2 h-4 w-4" />
                              View File
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upload requests found
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Review work with us applications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApplications ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : jobApplications && jobApplications.length > 0 ? (
                <div className="space-y-4">
                  {jobApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <CustomBadge variant={
                                application.status === 'approved' ? 'success' : 
                                application.status === 'pending' ? 'warning' : 'destructive'
                              }>
                                {application.status}
                              </CustomBadge>
                              <CardTitle className="text-lg">{application.position}</CardTitle>
                            </div>
                            <CardDescription>
                              Applied by {application.profiles?.username || 'Unknown'} 
                              on {format(new Date(application.created_at), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium">Contact Information:</h4>
                              <p className="text-sm">{application.profiles?.email || 'No email'}</p>
                              <p className="text-sm">{application.phone || 'No phone'}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Experience:</h4>
                              <p className="text-sm">{application.experience} years</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium">Cover Letter:</h4>
                            <p className="text-sm">{application.cover_letter || 'No cover letter provided'}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        {application.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline"
                              onClick={() => updateApplicationStatus.mutate({
                                applicationId: application.id,
                                newStatus: 'rejected'
                              })}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => updateApplicationStatus.mutate({
                                applicationId: application.id,
                                newStatus: 'approved'
                              })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </>
                        )}
                        {application.resume_url && (
                          <Button variant="outline" asChild>
                            <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="mr-2 h-4 w-4" />
                              View Resume
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No job applications found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure application-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="maintenance_mode" className="flex items-center">
                        <span>Maintenance Mode</span>
                        {systemSettings.maintenance_mode && (
                          <CustomBadge variant="destructive" className="ml-2">
                            Active
                          </CustomBadge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When enabled, only admins can access the application
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="maintenance_mode"
                        checked={systemSettings.maintenance_mode}
                        onCheckedChange={(checked) => 
                          setSystemSettings({...systemSettings, maintenance_mode: !!checked})
                        }
                        disabled={!isEditingSettings}
                      />
                      <label
                        htmlFor="maintenance_mode"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable maintenance mode
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="require_email_verification">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to verify their email before accessing the application
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require_email_verification"
                        checked={systemSettings.require_email_verification}
                        onCheckedChange={(checked) => 
                          setSystemSettings({...systemSettings, require_email_verification: !!checked})
                        }
                        disabled={!isEditingSettings}
                      />
                      <label
                        htmlFor="require_email_verification"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Require email verification
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="allow_social_login">Social Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to sign in with social media accounts
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_social_login"
                        checked={systemSettings.allow_social_login}
                        onCheckedChange={(checked) => 
                          setSystemSettings({...systemSettings, allow_social_login: !!checked})
                        }
                        disabled={!isEditingSettings}
                      />
                      <label
                        htmlFor="allow_social_login"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable social login
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="max_upload_size">Maximum Upload Size (MB)</Label>
                      <p className="text-sm text-muted-foreground">
                        Set the maximum file size users can upload
                      </p>
                    </div>
                    <Input
                      id="max_upload_size"
                      type="number"
                      value={systemSettings.max_upload_size_mb}
                      onChange={(e) => 
                        setSystemSettings({
                          ...systemSettings, 
                          max_upload_size_mb: parseInt(e.target.value) || 10
                        })
                      }
                      disabled={!isEditingSettings}
                      min={1}
                      max={100}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="default_user_role">Default User Role</Label>
                      <p className="text-sm text-muted-foreground">
                        Set the default role for new user registrations
                      </p>
                    </div>
                    <Select
                      value={systemSettings.default_user_role}
                      onValueChange={(value) => 
                        setSystemSettings({...systemSettings, default_user_role: value})
                      }
                      disabled={!isEditingSettings}
                    >
                      <SelectTrigger id="default_user_role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="enable_analytics">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect anonymous usage data to improve the application
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable_analytics"
                        checked={systemSettings.enable_analytics}
                        onCheckedChange={(checked) => 
                          setSystemSettings({...systemSettings, enable_analytics: !!checked})
                        }
                        disabled={!isEditingSettings}
                      />
                      <label
                        htmlFor="enable_analytics"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable analytics
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isEditingSettings ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingSettings(false);
                      // Reset to original values
                      if (fetchedSettings) {
                        setSystemSettings(fetchedSettings);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={updateSystemSettings.isPending}
                  >
                    {updateSystemSettings.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditingSettings(true)}
                  className="ml-auto"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Settings
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
