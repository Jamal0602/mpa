
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReferralDisplay } from "@/components/referral/ReferralDisplay";
import { ReferralList } from "@/components/referral/ReferralList";
import { ReferralCodeForm } from "@/components/referral/ReferralCodeForm";

function Referral() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
        .select('referral_code')
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

  return (
    <PageLayout 
      title="Refer & Earn"
      requireAuth={true}
    >
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
    </PageLayout>
  );
}

export default Referral;
