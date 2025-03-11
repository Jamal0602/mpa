
import { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { PageLayout } from "@/components/layout/PageLayout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  Users, ShoppingBag, CreditCard, EyeIcon, Award, Sparkles, 
  UserCog, BarChart2, Calendar, DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Analytics = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalAccounts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeEmployees: 0,
    totalViews: 0,
    adsenseRevenue: 0,
    liveUsers: 0,
    ordersLastWeek: 0
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total accounts
        const { count: accountsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Fetch total orders/projects
        const { count: ordersCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        
        // Fetch employees
        const { count: employeesCount } = await supabase
          .from('employee_access')
          .select('*', { count: 'exact', head: true });
          
        // Fetch orders from last 7 days
        const lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        
        const { count: recentOrdersCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastWeekDate.toISOString());
          
        // Dummy data for views and revenue (these would typically come from external APIs)
        const totalViews = Math.floor(Math.random() * 10000) + 5000;
        const adsenseRevenue = parseFloat((Math.random() * 500 + 100).toFixed(2));
        const totalRevenue = parseFloat((Math.random() * 10000 + 1000).toFixed(2));
        const liveUsers = Math.floor(Math.random() * 50) + 10;
        
        // Generate dummy views data for chart
        const dummyViewsData = [];
        const today = new Date();
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          dummyViewsData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: Math.floor(Math.random() * 500) + 100,
            users: Math.floor(Math.random() * 100) + 20,
          });
        }
        
        setViewsData(dummyViewsData);
        setAnalyticsData({
          totalAccounts: accountsCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue,
          activeEmployees: employeesCount || 0,
          totalViews,
          adsenseRevenue,
          liveUsers,
          ordersLastWeek: recentOrdersCount || 0
        });
        
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up live data polling
    const interval = setInterval(() => {
      // Update live users with random fluctuation
      setAnalyticsData(prev => ({
        ...prev,
        liveUsers: Math.max(1, prev.liveUsers + Math.floor(Math.random() * 5) - 2)
      }));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAdminLoading, navigate]);

  if (isAdminLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageLayout
      title="Analytics Dashboard"
      description="Monitor site performance and user engagement"
      requireAuth={true}
    >
      <div className="space-y-8">
        {/* Live stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Live Users</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">{analyticsData.liveUsers}</h3>
                    <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900 animate-pulse">Live</Badge>
                  </div>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Orders</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">{analyticsData.ordersLastWeek}</h3>
                    <Badge variant="outline" className="ml-2">Last 7 days</Badge>
                  </div>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AdSense Revenue</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">${analyticsData.adsenseRevenue}</h3>
                    <Badge variant="outline" className="ml-2">This Month</Badge>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">{analyticsData.activeEmployees}</h3>
                    <Badge variant="outline" className="ml-2">Total</Badge>
                  </div>
                </div>
                <UserCog className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Primary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total User Accounts</CardTitle>
              <CardDescription>All registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">{analyticsData.totalAccounts}</h3>
                <Users className="h-10 w-10 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Orders</CardTitle>
              <CardDescription>All project orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">{analyticsData.totalOrders}</h3>
                <ShoppingBag className="h-10 w-10 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Revenue</CardTitle>
              <CardDescription>From all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</h3>
                <CreditCard className="h-10 w-10 text-primary opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <Tabs defaultValue="traffic">
          <TabsList className="mb-4">
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
                <CardDescription>Views and users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="users" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
                <CardDescription>Monthly completed projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Jan', completed: 20, pending: 5 },
                        { name: 'Feb', completed: 15, pending: 8 },
                        { name: 'Mar', completed: 25, pending: 12 },
                        { name: 'Apr', completed: 22, pending: 7 },
                        { name: 'May', completed: 30, pending: 10 },
                        { name: 'Jun', completed: 28, pending: 5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                      <Bar dataKey="pending" fill="#82ca9d" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Monthly earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: 'Jan', service: 1000, adsense: 400 },
                        { name: 'Feb', service: 1200, adsense: 380 },
                        { name: 'Mar', service: 900, adsense: 420 },
                        { name: 'Apr', service: 1500, adsense: 450 },
                        { name: 'May', service: 1800, adsense: 470 },
                        { name: 'Jun', service: 1400, adsense: 500 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Line type="monotone" dataKey="service" stroke="#8884d8" name="Service Revenue" />
                      <Line type="monotone" dataKey="adsense" stroke="#82ca9d" name="AdSense Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Analytics;
