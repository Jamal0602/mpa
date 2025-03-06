
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
import { Loader2, Users, ShoppingCart, DollarSign, BarChart3, Activity, TrendingUp, Briefcase } from "lucide-react";

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

        // Use the new get_admin_analytics database function
        const { data, error } = await supabase
          .rpc('get_admin_analytics');

        if (error) throw error;

        // Calculate revenue data (this would come from a real source in production)
        // For now, we'll use placeholder data
        const totalRevenue = Math.floor(Math.random() * 50000) + 10000; // Placeholder
        const adSenseRevenue = Math.floor(totalRevenue * 0.15); // 15% from AdSense (placeholder)

        // Set all analytics data
        setAnalyticsData({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalOrders: data.totalOrders || 0,
          recentOrders: data.recentOrders || 0,
          totalEmployees: data.totalEmployees || 0,
          totalRevenue: totalRevenue,
          adSenseRevenue: adSenseRevenue,
        });

        // Generate weekly chart data
        const fetchWeeklyData = async () => {
          // In a real application, you would fetch this from a database or API
          // For now, we'll generate placeholder data
          const weeklyChartData: ChartData[] = [];
          
          // Generate data for the last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Fetch real data for this day (placeholder for now)
            weeklyChartData.push({
              name: dateStr,
              users: Math.floor(Math.random() * 100) + 20, // Placeholder data
              orders: Math.floor(Math.random() * 30) + 5,  // Placeholder data
              revenue: Math.floor(Math.random() * 5000) + 1000 // Placeholder data
            });
          }

          setWeeklyData(weeklyChartData);
        };

        await fetchWeeklyData();

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
