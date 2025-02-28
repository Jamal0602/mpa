
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, BarChart2, PieChart, Activity, CreditCard, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AdminControls } from "@/components/admin/AdminControls";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingPage } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

// Import Recharts components
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsP, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

// Types for the user profile including key points
interface UserProfile {
  id: string;
  username: string;
  mpa_id: string;
  avatar_url: string;
  role: string;
  key_points: number;
  display_name: string;
  last_login: string;
  theme_preference: string;
  country: string;
  state: string;
}

interface KeyPointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  transaction_type: 'earn' | 'spend' | 'admin';
  created_at: string;
}

// Sample data for charts
const activityData = [
  { name: 'Jan', uploads: 4, posts: 24, value: 2400 },
  { name: 'Feb', uploads: 3, posts: 13, value: 1398 },
  { name: 'Mar', uploads: 2, posts: 98, value: 9800 },
  { name: 'Apr', uploads: 2, posts: 39, value: 3908 },
  { name: 'May', uploads: 1, posts: 48, value: 4800 },
  { name: 'Jun', uploads: 2, posts: 38, value: 3800 },
  { name: 'Jul', uploads: 3, posts: 43, value: 4300 }
];

const pieData = [
  { name: 'Uploads', value: 400 },
  { name: 'Posts', value: 300 },
  { name: 'Comments', value: 300 },
  { name: 'Points Used', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [themePreference, setThemePreference] = useState("system");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionDescription, setTransactionDescription] = useState("");
  const [isMasterMind, setIsMasterMind] = useState(false);
  
  // Query for key points transactions
  const { data: transactions, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ["keypoints-transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("key_points_transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as KeyPointsTransaction[];
    },
    enabled: !!user
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setThemePreference(data.theme_preference || "system");
        
        // Check if user is MasterMind
        setIsMasterMind(data.username === "mastermind");
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Set up real-time subscription
    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAddKeyPoints = async () => {
    if (!user || !profile || transactionAmount === 0) return;
    
    try {
      // Update the profile key_points
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          key_points: (profile.key_points || 0) + transactionAmount 
        })
        .eq("id", user.id);
      
      if (profileError) throw profileError;
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from("key_points_transactions")
        .insert({
          user_id: user.id,
          amount: transactionAmount,
          description: transactionDescription || `Admin adjustment: ${transactionAmount > 0 ? 'added' : 'deducted'} points`,
          transaction_type: 'admin'
        });
      
      if (transactionError) throw transactionError;
      
      toast.success(`${Math.abs(transactionAmount)} Spark Points ${transactionAmount > 0 ? 'added to' : 'deducted from'} account`);
      setIsTransactionModalOpen(false);
      setTransactionAmount(0);
      setTransactionDescription("");
      refetchTransactions();
    } catch (error: any) {
      toast.error(`Failed to update Spark Points: ${error.message}`);
    }
  };

  const updateThemePreference = async (newTheme: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ theme_preference: newTheme })
        .eq("id", user.id);
        
      if (error) throw error;
      setThemePreference(newTheme);
      setTheme(newTheme);
      toast.success("Theme preference updated");
    } catch (error: any) {
      toast.error(`Failed to update theme: ${error.message}`);
    }
  };

  if (loading || isAdminLoading) {
    return <LoadingPage />;
  }

  // Only show admin controls if user is MasterMind admin
  const showAdminPanel = isAdmin && (isMasterMind || process.env.NODE_ENV === 'development');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Dashboard</h1>
            {isAdmin && (
              <Badge variant="secondary" className="animate-pulse">Admin</Badge>
            )}
            {isMasterMind && (
              <Badge variant="destructive" className="animate-pulse">MasterMind</Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{profile?.display_name || profile?.username}</p>
                <p className="text-xs text-muted-foreground">{profile?.mpa_id || "No MPA ID"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container px-4 py-8">
        {showAdminPanel ? (
          <AdminControls />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* User Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Spark Points</CardTitle>
                  <CardDescription>Your virtual currency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{profile?.key_points || 0}</div>
                    <CreditCard className="text-primary h-5 w-5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use points for uploads and premium features
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>Your recent actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">24</div>
                    <Activity className="text-primary h-5 w-5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Actions in the last 30 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={themePreference} onValueChange={updateThemePreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Location</CardTitle>
                  <CardDescription>Your registered location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-md font-medium">
                      {profile?.country || "Not set"}{profile?.state ? `, ${profile.state}` : ""}
                    </div>
                    <Settings className="text-primary h-5 w-5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Data Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>Last 7 months</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activityData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="uploads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="posts" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Activity Distribution</CardTitle>
                  <CardDescription>Breakdown of actions</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsP>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsP>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Spark Points Transactions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Spark Points Transactions</CardTitle>
                    <CardDescription>History of your Spark Points activity</CardDescription>
                  </div>
                  
                  {isAdmin && (
                    <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Manage Points</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add or Remove Spark Points</DialogTitle>
                          <DialogDescription>
                            Enter an amount (positive to add, negative to remove) and a description.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={transactionAmount}
                              onChange={(e) => setTransactionAmount(parseInt(e.target.value))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              value={transactionDescription}
                              onChange={(e) => setTransactionDescription(e.target.value)}
                              placeholder="Reason for adjustment"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button onClick={handleAddKeyPoints}>
                            {transactionAmount > 0 ? 'Add Points' : 'Remove Points'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading ? (
                  <div className="py-4 text-center">Loading transactions...</div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={transaction.amount > 0 ? "default" : "destructive"}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} Points
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No transactions found. Spark Points activity will appear here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
