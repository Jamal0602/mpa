
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReferralDisplay } from "@/components/referral/ReferralDisplay";
import { ReferralList } from "@/components/referral/ReferralList";
import { ReferralCodeForm } from "@/components/referral/ReferralCodeForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, UserPlus, Gift, TrendingUp } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";

function Referral() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalPointsEarned: 0,
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUser(data.session.user);
      fetchUserReferralData(data.session.user.id);
    };

    checkSession();
  }, [navigate]);

  const fetchUserReferralData = async (userId) => {
    setLoading(true);
    try {
      // Get profile data including referral code
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, key_points')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      if (profileData && profileData.referral_code) {
        setReferralCode(profileData.referral_code);
        setReferralLink(`${window.location.origin}/referral?code=${profileData.referral_code}`);
      }

      // Get referrals made by the user
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          status,
          bonus_earned,
          created_at,
          completed_at,
          profiles:referred_id(username, full_name)
        `)
        .eq('referrer_id', userId);

      if (referralsError) throw referralsError;
      
      setReferrals(referralsData || []);
      
      // Calculate stats
      const totalReferrals = referralsData ? referralsData.length : 0;
      const pendingReferrals = referralsData ? referralsData.filter(r => r.status === 'pending').length : 0;
      const completedReferrals = referralsData ? referralsData.filter(r => r.status === 'completed').length : 0;
      const totalPointsEarned = referralsData ? 
        referralsData.reduce((sum, referral) => sum + (referral.status === 'completed' ? referral.bonus_earned : 0), 0) : 0;
      
      setStats({
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        totalPointsEarned
      });
      
      // Set up real-time subscription for referrals
      const referralsChannel = supabase
        .channel('referrals-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'referrals',
            filter: `referrer_id=eq.${userId}`
          },
          (payload) => {
            // Refresh data when changes occur
            fetchUserReferralData(userId);
          }
        )
        .subscribe();
        
      // Set up real-time subscription for profile updates  
      const profileChannel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            // Update referral code if it changes
            if (payload.new && payload.new.referral_code) {
              setReferralCode(payload.new.referral_code);
              setReferralLink(`${window.location.origin}/referral?code=${payload.new.referral_code}`);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(referralsChannel);
        supabase.removeChannel(profileChannel);
      };

    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <PageLayout 
      title="Refer & Earn"
      description="Invite friends and earn Spark Points for each successful referral"
      requireAuth={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <h2 className="text-3xl font-bold">{stats.totalReferrals}</h2>
              </div>
              <UserPlus className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h2 className="text-3xl font-bold">{stats.completedReferrals}</h2>
              </div>
              <Award className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h2 className="text-3xl font-bold">{stats.pendingReferrals}</h2>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Earned</p>
                <h2 className="text-3xl font-bold">{stats.totalPointsEarned}</h2>
              </div>
              <Gift className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ScrollArea className="max-h-[calc(100vh-320px)]">
        <Tabs defaultValue="refer">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="refer">Share Your Code</TabsTrigger>
            <TabsTrigger value="enter">Enter a Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="refer">
            <ReferralDisplay 
              referralCode={referralCode}
              referralLink={referralLink}
              loading={loading}
            />
            
            <ReferralList 
              referrals={referrals}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="enter">
            {user && (
              <ReferralCodeForm 
                userId={user.id}
                onSuccess={() => fetchUserReferralData(user.id)}
              />
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </PageLayout>
  );
}

export default Referral;
