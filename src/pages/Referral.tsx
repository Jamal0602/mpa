
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Copy, Check } from "lucide-react";
import { ClipboardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Referral() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referredCode, setReferredCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard",
        });
      },
      (err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        });
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on our platform!',
          text: 'Use my referral link to join and get bonus Spark Points!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const submitReferralCode = async () => {
    if (!referredCode || referredCode.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a valid referral code",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to use a referral code",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already used a referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', user.id)
        .single();

      if (profileData && profileData.referred_by) {
        toast({
          title: "Already referred",
          description: "You've already used a referral code",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if the referral code exists and is not the user's own code
      const { data: referrerData } = await supabase
        .from('profiles')
        .select('id, referral_code')
        .eq('referral_code', referredCode)
        .single();

      if (!referrerData) {
        toast({
          title: "Invalid code",
          description: "This referral code doesn't exist",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (referrerData.id === user.id) {
        toast({
          title: "Invalid code",
          description: "You cannot use your own referral code",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Call the process_referral_bonus function
      const { data, error } = await supabase.rpc('process_referral_bonus', {
        referred_user_id: user.id,
        referrer_code: referredCode
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Referral code applied successfully. You've earned 10 Spark Points!",
      });
      
      // Refresh data
      fetchUserReferralData(user.id);
      setReferredCode("");
      
    } catch (error) {
      console.error("Error processing referral:", error);
      toast({
        title: "Error",
        description: "Failed to process referral. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Refer & Earn</h1>
      
      <Tabs defaultValue="refer">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="refer">Share Your Code</TabsTrigger>
          <TabsTrigger value="enter">Enter a Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="refer">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Referral Code</CardTitle>
              <CardDescription>
                Invite friends to join and both of you will receive 10 Spark Points when they sign up!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="referral-code">Your Referral Code</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input 
                        id="referral-code" 
                        value={referralCode} 
                        readOnly 
                        className="font-medium"
                      />
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode);
                          toast({ description: "Code copied to clipboard" });
                        }}
                      >
                        <ClipboardIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="referral-link">Referral Link</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input 
                        id="referral-link" 
                        value={referralLink} 
                        readOnly 
                        className="font-medium text-xs sm:text-sm"
                      />
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={handleCopyToClipboard}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button className="w-full sm:w-auto" onClick={handleCopyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button className="w-full sm:w-auto" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </CardFooter>
          </Card>
          
          {!loading && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>
                  People who have joined using your referral code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    You haven't referred anyone yet. Share your code to get started!
                  </div>
                ) : (
                  <div className="divide-y">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {referral.profiles?.full_name || referral.profiles?.username || 'User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            referral.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {referral.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                          {referral.status === 'completed' && (
                            <p className="text-sm font-medium text-green-600 mt-1">+{referral.bonus_earned} SP</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="enter">
          <Card>
            <CardHeader>
              <CardTitle>Enter a Referral Code</CardTitle>
              <CardDescription>
                Got a referral code from a friend? Enter it here to get 10 Spark Points!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referred-code">Referral Code</Label>
                <Input 
                  id="referred-code" 
                  placeholder="Enter referral code" 
                  value={referredCode}
                  onChange={(e) => setReferredCode(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={submitReferralCode}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : "Apply Code"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Referral;
