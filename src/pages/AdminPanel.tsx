
import { useState, useEffect } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading";
import { 
  Users, ShoppingBag, CreditCard, Bell, FileText, Upload, Settings, 
  UserCog, Shield, Database, BarChart2, RefreshCw, CheckCircle, 
  XCircle, AlertTriangle, User, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  mpa_id: string;
  key_points: number;
  role: string;
  last_login: string;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  owner_id: string;
  owner_name?: string;
}

interface ErrorReport {
  id: string;
  user_id: string;
  user_name?: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  page_url: string;
  severity: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState({
    users: true,
    projects: true,
    errors: true
  });
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    recentOrders: 0,
    totalEmployees: 0
  });
  const [refreshing, setRefreshing] = useState({
    users: false,
    projects: false,
    errors: false,
    analytics: false
  });
  
  // Fetch admin analytics
  const fetchAnalytics = async () => {
    try {
      setRefreshing({...refreshing, analytics: true});
      const { data, error } = await supabase.rpc('get_admin_analytics');
      
      if (error) {
        throw error;
      }
      
      setAnalyticsData(data);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast.error(`Failed to load analytics: ${error.message}`);
    } finally {
      setRefreshing({...refreshing, analytics: false});
    }
  };
  
  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      toast.error("🔒 Admin access required");
      navigate('/dashboard');
    } else if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, isAdminLoading, navigate]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!isAdmin) return;
    
    const usersChannel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          fetchUsers();
        }
      )
      .subscribe();
      
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          fetchProjects();
        }
      )
      .subscribe();
      
    const errorsChannel = supabase
      .channel('errors-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'error_reports' },
        (payload) => {
          fetchErrorReports();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(errorsChannel);
    };
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading({...loading, users: true});
      setRefreshing({...refreshing, users: true});
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading({...loading, users: false});
      setRefreshing({...refreshing, users: false});
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading({...loading, projects: true});
      setRefreshing({...refreshing, projects: true});
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get owner names
      const projectsWithOwners = await Promise.all(
        (data || []).map(async (project) => {
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', project.owner_id)
            .single();
            
          return {
            ...project,
            owner_name: ownerData?.full_name || ownerData?.username || 'Unknown'
          };
        })
      );
      
      setProjects(projectsWithOwners);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error(`Failed to load projects: ${error.message}`);
    } finally {
      setLoading({...loading, projects: false});
      setRefreshing({...refreshing, projects: false});
    }
  };

  const fetchErrorReports = async () => {
    try {
      setLoading({...loading, errors: true});
      setRefreshing({...refreshing, errors: true});
      const { data, error } = await supabase
        .from('error_reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get user names
      const errorsWithUsers = await Promise.all(
        (data || []).map(async (report) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', report.user_id)
            .single();
            
          return {
            ...report,
            user_name: userData?.full_name || userData?.username || 'Unknown'
          };
        })
      );
      
      setErrorReports(errorsWithUsers);
    } catch (error: any) {
      console.error("Error fetching error reports:", error);
      toast.error(`Failed to load error reports: ${error.message}`);
    } finally {
      setLoading({...loading, errors: false});
      setRefreshing({...refreshing, errors: false});
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchProjects();
      fetchErrorReports();
    }
  }, [isAdmin]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery("");
  };

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsUserDialogOpen(true);
  };

  const handleProjectClick = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };

  const handleErrorClick = (error: ErrorReport) => {
    setSelectedError(error);
    setResolutionNotes(error.resolution_notes || "");
    setIsErrorDialogOpen(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser || selectedRole === selectedUser.role) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      
      toast.success(`✅ User role updated to ${selectedRole}`);
      setIsUserDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(`Failed to update role: ${error.message}`);
    }
  };

  const addUserPoints = async () => {
    if (!selectedUser || pointsToAdd === 0) return;
    
    try {
      // Update the profile key_points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ key_points: (selectedUser.key_points || 0) + pointsToAdd })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('key_points_transactions')
        .insert({
          user_id: selectedUser.id,
          amount: pointsToAdd,
          description: `Admin adjustment: added ${pointsToAdd} points`,
          transaction_type: 'admin'
        });
      
      if (transactionError) throw transactionError;
      
      toast.success(`✅ Added ${pointsToAdd} Spark Points to user`);
      setPointsToAdd(0);
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding points:", error);
      toast.error(`Failed to add points: ${error.message}`);
    }
  };

  const updateProjectStatus = async (newStatus: string) => {
    if (!selectedProject) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', selectedProject.id);
        
      if (error) throw error;
      
      toast.success(`✅ Project status updated to ${newStatus}`);
      setIsProjectDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      console.error("Error updating project status:", error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const resolveErrorReport = async (newStatus: string) => {
    if (!selectedError) return;
    
    try {
      const { error } = await supabase.rpc(
        'update_error_report_status',
        { 
          report_id: selectedError.id,
          new_status: newStatus,
          resolution_notes: resolutionNotes
        }
      );
      
      if (error) throw error;
      
      toast.success(`✅ Error report marked as ${newStatus}`);
      setIsErrorDialogOpen(false);
      fetchErrorReports();
    } catch (error: any) {
      console.error("Error resolving error report:", error);
      toast.error(`Failed to resolve error: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mpa_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project => 
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredErrors = errorReports.filter(error => 
    error.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    error.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    error.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAdminLoading) {
    return <LoadingPage />;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  const renderUserDetails = (user: UserProfile) => (
    <div className="p-4 border rounded-lg hover:shadow-md transition-all flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-medium">{user.full_name || user.username}</h3>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{user.mpa_id}</span>
            <span>•</span>
            <span>{new Date(user.last_login).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={
          user.role === 'admin' ? 'destructive' : 
          user.role === 'moderator' ? 'default' : 
          'secondary'
        }>
          {user.role === 'admin' ? '👑 ' : user.role === 'moderator' ? '🛡️ ' : '👤 '}
          {user.role}
        </Badge>
        <Badge variant="outline">✨ {user.key_points}</Badge>
        <Button size="sm" variant="ghost" onClick={() => handleUserClick(user)}>
          Manage
        </Button>
      </div>
    </div>
  );

  const renderProjectItem = (project: ProjectItem) => (
    <div className="p-4 border rounded-lg hover:shadow-md transition-all flex items-center justify-between">
      <div>
        <h3 className="font-medium">{project.title}</h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>By: {project.owner_name}</span>
          <span>•</span>
          <span>{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
        <p className="text-sm line-clamp-1 mt-1">{project.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={
          project.status === 'active' ? 'default' : 
          project.status === 'completed' ? 'success' : 
          project.status === 'pending' ? 'warning' : 
          'secondary'
        }>
          {project.status === 'active' ? '🟢 ' : 
           project.status === 'completed' ? '✅ ' : 
           project.status === 'pending' ? '⏳ ' : 
           project.status === 'cancelled' ? '❌ ' : ''}
          {project.status}
        </Badge>
        <Button size="sm" variant="ghost" onClick={() => handleProjectClick(project)}>
          Manage
        </Button>
      </div>
    </div>
  );

  const renderErrorReport = (error: ErrorReport) => (
    <div className="p-4 border rounded-lg hover:shadow-md transition-all">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium">{error.title}</h3>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>By: {error.user_name}</span>
            <span>•</span>
            <span>{new Date(error.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={
            error.severity === 'high' ? 'destructive' : 
            error.severity === 'medium' ? 'warning' : 
            'secondary'
          }>
            {error.severity === 'high' ? '🔴 ' : 
             error.severity === 'medium' ? '🟠 ' : 
             '🟢 '}
            {error.severity}
          </Badge>
          <Badge variant={
            error.status === 'resolved' ? 'success' : 
            error.status === 'in_progress' ? 'default' : 
            'outline'
          }>
            {error.status === 'resolved' ? '✅ ' : 
             error.status === 'in_progress' ? '🔧 ' : 
             '🔔 '}
            {error.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      <p className="text-sm mt-2 line-clamp-2">{error.description}</p>
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-muted-foreground">
          <span>Page: {error.page_url}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => handleErrorClick(error)}>
          Manage
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Control Center
          </h1>
          <p className="text-muted-foreground">
            Manage users, projects, and system settings
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={fetchAnalytics}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing.analytics ? "animate-spin" : ""}`} />
            Refresh Stats
          </Button>
          
          <Button 
            variant="default"
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            Full Analytics
          </Button>
        </div>
      </div>
      
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">👥 Total Users</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalUsers}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.activeUsers} active this week
                </p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">🛒 Projects</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalOrders}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.recentOrders} new this week
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">🧑‍💼 Employees</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalEmployees}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Active team members
                </p>
              </div>
              <UserCog className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">🔔 Error Reports</p>
                <h3 className="text-2xl font-bold">{errorReports.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {errorReports.filter(e => e.status !== 'resolved').length} unresolved
                </p>
              </div>
              <Bell className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Error Reports</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex mb-4">
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => {
              if (activeTab === "users") fetchUsers();
              if (activeTab === "projects") fetchProjects();
              if (activeTab === "errors") fetchErrorReports();
            }}
          >
            <RefreshCw className={`h-4 w-4 ${
              (activeTab === "users" && refreshing.users) ||
              (activeTab === "projects" && refreshing.projects) ||
              (activeTab === "errors" && refreshing.errors)
                ? "animate-spin"
                : ""
            }`} />
          </Button>
        </div>
        
        <TabsContent value="dashboard">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Activity Chart */}
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>📊 User Activity</CardTitle>
                <CardDescription>Last 7 days user registration</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { name: 'Mon', users: 4 },
                      { name: 'Tue', users: 3 },
                      { name: 'Wed', users: 5 },
                      { name: 'Thu', users: 7 },
                      { name: 'Fri', users: 2 },
                      { name: 'Sat', users: 6 },
                      { name: 'Sun', users: 8 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>💻 System Status</CardTitle>
                <CardDescription>Current platform health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Authentication
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Database
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Storage
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      API Services
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      Payment Gateway
                    </span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      Degraded
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Full Status
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent Activity */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>🕒 Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Badge className="mr-2" variant="outline">👤</Badge>
                    <span>New user registration - <span className="font-medium">john.doe</span></span>
                    <span className="ml-auto text-xs text-muted-foreground">2 min ago</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className="mr-2" variant="outline">📝</Badge>
                    <span>Project status updated - <span className="font-medium">Website Redesign</span></span>
                    <span className="ml-auto text-xs text-muted-foreground">15 min ago</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className="mr-2" variant="outline">✨</Badge>
                    <span>Points awarded to user - <span className="font-medium">alice.smith</span></span>
                    <span className="ml-auto text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className="mr-2" variant="outline">🔔</Badge>
                    <span>Error report resolved - <span className="font-medium">#ERR-2023-06</span></span>
                    <span className="ml-auto text-xs text-muted-foreground">3 hours ago</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className="mr-2" variant="outline">🚀</Badge>
                    <span>New project created - <span className="font-medium">Mobile App Development</span></span>
                    <span className="ml-auto text-xs text-muted-foreground">Yesterday</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>👥 User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.users ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredUsers.map(user => renderUserDetails(user))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No users found"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Project Management</CardTitle>
              <CardDescription>Monitor and manage projects</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.projects ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="space-y-3">
                  {filteredProjects.map(project => renderProjectItem(project))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No projects found matching your search" : "No projects found"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>🔔 Error Reports</CardTitle>
              <CardDescription>Review and resolve user-reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.errors ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredErrors.length > 0 ? (
                <div className="space-y-3">
                  {filteredErrors.map(error => renderErrorReport(error))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No error reports found matching your search" : "No error reports found"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ System Settings</CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="registration">
                  <AccordionTrigger>👤 User Registration</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Open Registration</h4>
                          <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Verification</h4>
                          <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Default User Role</h4>
                          <p className="text-sm text-muted-foreground">Set the default role for new users</p>
                        </div>
                        <Select defaultValue="user">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="payments">
                  <AccordionTrigger>💳 Payment Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Enable Payments</h4>
                          <p className="text-sm text-muted-foreground">Accept payments on the platform</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Payment Gateway</h4>
                          <p className="text-sm text-muted-foreground">Select active payment provider</p>
                        </div>
                        <Select defaultValue="stripe">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select gateway" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Payment Verification</h4>
                          <p className="text-sm text-muted-foreground">Manual approval for transactions</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="uploads">
                  <AccordionTrigger>📤 Upload Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Enable Uploads</h4>
                          <p className="text-sm text-muted-foreground">Allow users to upload files</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Max File Size</h4>
                          <p className="text-sm text-muted-foreground">Maximum upload size in MB</p>
                        </div>
                        <Input type="number" defaultValue="10" className="w-24" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Allowed File Types</h4>
                          <p className="text-sm text-muted-foreground">File extensions that can be uploaded</p>
                        </div>
                        <Input defaultValue="jpg,png,pdf,doc,docx" className="w-64" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing">
                  <AccordionTrigger>✨ Spark Points Economy</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Default Points for New Users</h4>
                          <p className="text-sm text-muted-foreground">Starting points for new accounts</p>
                        </div>
                        <Input type="number" defaultValue="10" className="w-24" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Points for Each Upload</h4>
                          <p className="text-sm text-muted-foreground">Cost in points per upload</p>
                        </div>
                        <Input type="number" defaultValue="5" className="w-24" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Referral Bonus</h4>
                          <p className="text-sm text-muted-foreground">Points awarded for referring a new user</p>
                        </div>
                        <Input type="number" defaultValue="15" className="w-24" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="notifications">
                  <AccordionTrigger>🔔 Notification Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Send emails for important events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Admin Alerts</h4>
                          <p className="text-sm text-muted-foreground">Send notifications to admins for critical events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">User Activity Notifications</h4>
                          <p className="text-sm text-muted-foreground">Notify users about account activity</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="api">
                  <AccordionTrigger>🔌 API Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Enable API Access</h4>
                          <p className="text-sm text-muted-foreground">Allow API access to the platform</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Rate Limiting</h4>
                          <p className="text-sm text-muted-foreground">Max requests per minute</p>
                        </div>
                        <Input type="number" defaultValue="60" className="w-24" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">API Key Management</h4>
                          <p className="text-sm text-muted-foreground">Configure API keys</p>
                        </div>
                        <Button variant="outline" size="sm">Manage Keys</Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline">Reset Defaults</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* User Management Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Manage User
            </DialogTitle>
            <DialogDescription>
              Modify user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedUser.full_name || selectedUser.username}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.mpa_id}</p>
                </div>
                <Badge variant={
                  selectedUser.role === 'admin' ? 'destructive' : 
                  selectedUser.role === 'moderator' ? 'default' : 
                  'secondary'
                }>
                  Current Role: {selectedUser.role}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Change Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">👑 Admin</SelectItem>
                    <SelectItem value="moderator">🛡️ Moderator</SelectItem>
                    <SelectItem value="employee">🧑‍💼 Employee</SelectItem>
                    <SelectItem value="user">👤 User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <Label>Current Spark Points: {selectedUser.key_points}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={pointsToAdd === 0 ? "" : pointsToAdd}
                    onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                  />
                  <Button onClick={addUserPoints} disabled={pointsToAdd === 0}>
                    Add Points
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-medium">🔄 Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Reset Password
                  </Button>
                  <Button variant="outline" size="sm">
                    View Activity
                  </Button>
                  <Button variant="outline" size="sm">
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={updateUserRole} 
              disabled={!selectedUser || selectedRole === selectedUser.role}
            >
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Project Management Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Manage Project
            </DialogTitle>
            <DialogDescription>
              Update project status and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium">{selectedProject.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Owner: {selectedProject.owner_name}
                </p>
                <p className="text-sm mt-2">{selectedProject.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Current Status:</span>
                <Badge variant={
                  selectedProject.status === 'active' ? 'default' : 
                  selectedProject.status === 'completed' ? 'success' : 
                  selectedProject.status === 'pending' ? 'warning' : 
                  'secondary'
                }>
                  {selectedProject.status === 'active' ? '🟢 ' : 
                   selectedProject.status === 'completed' ? '✅ ' : 
                   selectedProject.status === 'pending' ? '⏳ ' : 
                   selectedProject.status === 'cancelled' ? '❌ ' : ''}
                  {selectedProject.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={selectedProject.status === 'active' ? 'default' : 'outline'} 
                    onClick={() => updateProjectStatus('active')}
                  >
                    🟢 Active
                  </Button>
                  <Button 
                    variant={selectedProject.status === 'pending' ? 'default' : 'outline'} 
                    onClick={() => updateProjectStatus('pending')}
                  >
                    ⏳ Pending
                  </Button>
                  <Button 
                    variant={selectedProject.status === 'completed' ? 'default' : 'outline'} 
                    onClick={() => updateProjectStatus('completed')}
                  >
                    ✅ Completed
                  </Button>
                  <Button 
                    variant={selectedProject.status === 'cancelled' ? 'default' : 'outline'} 
                    onClick={() => updateProjectStatus('cancelled')}
                  >
                    ❌ Cancelled
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-medium">🔄 Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact Owner
                  </Button>
                  <Button variant="outline" size="sm">
                    View Timeline
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Error Report Dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Error Report Details
            </DialogTitle>
            <DialogDescription>
              Review and resolve reported issues
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4 py-4">
              <div>
                <div className="flex justify-between">
                  <h3 className="font-medium">{selectedError.title}</h3>
                  <Badge variant={
                    selectedError.severity === 'high' ? 'destructive' : 
                    selectedError.severity === 'medium' ? 'warning' : 
                    'secondary'
                  }>
                    {selectedError.severity === 'high' ? '🔴 ' : 
                     selectedError.severity === 'medium' ? '🟠 ' : 
                     '🟢 '}
                    {selectedError.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reported by: {selectedError.user_name} on {new Date(selectedError.created_at).toLocaleString()}
                </p>
              </div>
              
              <ScrollArea className="h-[100px] rounded-md border p-4">
                <p className="text-sm">{selectedError.description}</p>
              </ScrollArea>
              
              <div className="text-sm">
                <span className="font-medium">Page:</span> {selectedError.page_url}
              </div>
              
              <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Input
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about the resolution..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={selectedError.status === 'pending' ? 'default' : 'outline'} 
                    onClick={() => resolveErrorReport('pending')}
                  >
                    🔔 Pending
                  </Button>
                  <Button 
                    variant={selectedError.status === 'in_progress' ? 'default' : 'outline'} 
                    onClick={() => resolveErrorReport('in_progress')}
                  >
                    🔧 In Progress
                  </Button>
                  <Button 
                    variant={selectedError.status === 'resolved' ? 'default' : 'outline'} 
                    onClick={() => resolveErrorReport('resolved')}
                  >
                    ✅ Resolved
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
