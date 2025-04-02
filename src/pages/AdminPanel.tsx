
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
  CircleDashed
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Query to fetch error report statistics
  const { data: errorReportStats } = useQuery({
    queryKey: ["error-report-stats"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_error_report_stats");
        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Failed to fetch error report stats:", err);
        return { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 };
      }
    },
    enabled: !!isAdmin
  });

  useEffect(() => {
    if (!isAdmin && !isAdminLoading) {
      toast.error("You are not authorized to view this page.");
      navigate("/");
    }
  }, [isAdmin, isAdminLoading, navigate]);

  if (isAdminLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout
      title="Admin Panel"
      description="Manage users, services, payments, and system settings"
      requireAuth={true}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-7">
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Error Reports</CardTitle>
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
          </div>
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
    </PageLayout>
  );
};

export default AdminPanel;
