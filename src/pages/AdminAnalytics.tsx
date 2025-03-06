
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, ShoppingCart, DollarSign, BarChart3, Activity, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  recentOrders: number;
  totalEmployees: number;
  totalRevenue: number;
  adSenseRevenue: number;
}

interface ChartData {
  name: string;
  users?: number;
  orders?: number;
  revenue?: number;
}

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsAdmin();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    recentOrders: 0,
    totalEmployees: 0,
    totalRevenue: 0,
    adSenseRevenue: 0,
  });
  const [weeklyData, setWeeklyData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (adminCheckLoading) return;
    
    if (!isAdmin) {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch total users count
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;

        // Fetch active users (users who logged in within the last 7 days)
        const { count: activeUsers, error: activeUsersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("last_login", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (activeUsersError) throw activeUsersError;

        // Fetch total employees
        const { count: totalEmployees, error: employeesError } = await supabase
          .from("employee_access")
          .select("*", { count: "exact", head: true });

        if (employeesError) throw employeesError;

        // Fetch total orders and recent orders
        // Note: This assumes you have a orders table - adjust as needed
        const { count: totalOrders, error: ordersError } = await supabase
          .from("key_points_transactions")
          .select("*", { count: "exact", head: true })
          .eq("transaction_type", "purchase");

        if (ordersError) throw ordersError;

        // Fetch recent orders (last 7 days)
        const { count: recentOrders, error: recentOrdersError } = await supabase
          .from("key_points_transactions")
          .select("*", { count: "exact", head: true })
          .eq("transaction_type", "purchase")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (recentOrdersError) throw recentOrdersError;

        // Fetch weekly data for charts
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklyChartData: ChartData[] = [];
        
        // Generate data for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          weeklyChartData.push({
            name: dateStr,
            users: Math.floor(Math.random() * 100) + 20, // Placeholder data - replace with real data
            orders: Math.floor(Math.random() * 30) + 5,  // Placeholder data - replace with real data
            revenue: Math.floor(Math.random() * 5000) + 1000 // Placeholder data - replace with real data
          });
        }

        setWeeklyData(weeklyChartData);
        
        // Set all analytics data
        setAnalyticsData({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalOrders: totalOrders || 0,
          recentOrders: recentOrders || 0,
          totalEmployees: totalEmployees || 0,
          totalRevenue: 0, // Placeholder - replace with real data
          adSenseRevenue: 0, // Placeholder - replace with real data
        });

        // Set up realtime subscriptions for live updates
        const channel = supabase
          .channel('admin-analytics')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'profiles' 
          }, () => {
            // Refresh data on any profile changes
            fetchAnalyticsData();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error: any) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isAdmin, adminCheckLoading, navigate]);

  if (adminCheckLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-4 h-4 mr-2" /> Live Data
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">{analyticsData.totalUsers}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {analyticsData.activeUsers} active in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">{analyticsData.totalOrders}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {analyticsData.recentOrders} new in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              ${analyticsData.adSenseRevenue.toLocaleString()} from AdSense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" />
              <span className="text-2xl font-bold">{analyticsData.totalEmployees}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Across all departments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="orders" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
