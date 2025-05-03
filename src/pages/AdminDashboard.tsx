
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { PageLayout } from "@/components/layout/PageLayout";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, BarChart2, Circle, Clock, ExternalLink, FileText, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: errorStats, isLoading: statsLoading } = useQuery({
    queryKey: ['error-report-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_error_report_stats');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true
  });
  
  const { data: usersCount, isLoading: usersLoading } = useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count;
    },
    enabled: isAdmin === true
  });
  
  const { data: constructionState, isLoading: constructionLoading } = useQuery({
    queryKey: ['construction-state'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('id', 'construction')
        .single();
      
      if (error) return { construction_mode: false, construction_progress: 0 };
      return data?.value;
    },
    enabled: isAdmin === true
  });

  if (isAdminLoading) {
    return <PageLayout title="Admin Dashboard" description="Loading admin status..." />;
  }

  if (isAdmin === false) {
    navigate('/');
    return null;
  }
  
  const analyticsData = [
    { name: 'Jan', users: 40, projects: 24, services: 18 },
    { name: 'Feb', users: 30, projects: 13, services: 29 },
    { name: 'Mar', users: 20, projects: 98, services: 12 },
    { name: 'Apr', users: 27, projects: 39, services: 45 },
    { name: 'May', users: 18, projects: 48, services: 23 },
    { name: 'Jun', users: 23, projects: 38, services: 30 },
    { name: 'Jul', users: 34, projects: 43, services: 25 },
  ];
  
  const pieData = [
    { name: 'Pending', value: errorStats?.pending || 0, color: '#ff9800' },
    { name: 'In Progress', value: errorStats?.in_progress || 0, color: '#2196f3' },
    { name: 'Resolved', value: errorStats?.resolved || 0, color: '#4caf50' },
    { name: 'Rejected', value: errorStats?.rejected || 0, color: '#f44336' }
  ];
  
  const COLORS = ['#ff9800', '#2196f3', '#4caf50', '#f44336'];

  return (
    <PageLayout title="Admin Dashboard" description="Manage and monitor your application">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="errors">Error Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersLoading ? '...' : usersCount}</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <div onClick={() => setActiveTab('users')} className="flex justify-between w-full">
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">152</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full flex justify-between">
                  View details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsLoading ? '...' : errorStats?.total || 0}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {statsLoading ? '...' : errorStats?.pending || 0} pending
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    {statsLoading ? '...' : errorStats?.resolved || 0} resolved
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <div onClick={() => setActiveTab('errors')} className="flex justify-between w-full">
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Analytics chart */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                User growth and activity metrics for the past 7 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="projects" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="services" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Error report distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Error Report Status</CardTitle>
              <CardDescription>
                Current distribution of error reports by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {statsLoading ? (
                  <div className="text-muted-foreground">Loading data...</div>
                ) : errorStats?.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground">No error reports available</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Construction mode status */}
          <Card>
            <CardHeader>
              <CardTitle>Construction Mode</CardTitle>
              <CardDescription>
                Current maintenance and construction status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Circle className={`h-3 w-3 ${constructionState?.construction_mode ? 'fill-green-500 text-green-500' : 'fill-slate-500 text-slate-500'}`} />
                    <span>{constructionState?.construction_mode ? 'Active' : 'Inactive'}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    {constructionState?.construction_mode ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{constructionState?.construction_progress || 0}%</span>
                  </div>
                  <div className="w-full bg-secondary h-3 rounded-full">
                    <div 
                      className="bg-primary h-3 rounded-full" 
                      style={{ width: `${constructionState?.construction_progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            This section allows administrators to manage users, view their details, and modify their roles.
          </p>
          <Button className="mt-4">Go to Advanced User Management Panel</Button>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-4">
          <h2 className="text-2xl font-bold">Error Reports</h2>
          <p className="text-muted-foreground">
            View and manage error reports submitted by users.
          </p>
          <Button className="mt-4">Go to Error Management Panel</Button>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <h2 className="text-2xl font-bold">Services Management</h2>
          <p className="text-muted-foreground">
            Manage services, pricing, and availability.
          </p>
          <Button className="mt-4">Go to Services Management</Button>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-2xl font-bold">Admin Settings</h2>
          <p className="text-muted-foreground">
            Configure global application settings.
          </p>
          <Button className="mt-4">Go to Application Settings</Button>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default AdminDashboard;
