
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingPage } from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { Copy, Gift, Users, ArrowUpRight, Share, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Referral = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralEmail, setReferralEmail] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-referral", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("username, key_points")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      
      // This would be replaced with actual referral data from your database
      // For demo purposes, we're returning mock data
      return [
        { id: 1, username: "user123", date: "2023-04-15", status: "completed", bonusEarned: 10 },
        { id: 2, username: "newuser456", date: "2023-05-23", status: "pending", bonusEarned: 0 },
      ];
    },
    enabled: !!user,
  });
  
  if (profileLoading || referralsLoading) return <LoadingPage />;
  
  if (!user) {
    navigate("/auth");
    return null;
  }

  const referralCode = profile?.username || user.id.substring(0, 8);
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 3000);
  };
  
  const handleSendReferral = () => {
    if (!referralEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    // Here you would send the referral email
    // For demo purposes, we'll just show a success message
    toast.success(`Invitation sent to ${referralEmail}`);
    setReferralEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Referral Program</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Invite friends and earn Spark Points! Get 10 Spark Points for each friend who joins.
            </p>
          </div>
          
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Earn 10 Spark Points</h3>
                    <p className="text-sm text-muted-foreground">For each friend who joins</p>
                  </div>
                </div>
                
                <Button onClick={() => document.getElementById("share-tab")?.click()}>
                  <Share className="mr-2 h-4 w-4" />
                  Share Now
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="share">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="share" id="share-tab">Share & Earn</TabsTrigger>
              <TabsTrigger value="history">Referral History</TabsTrigger>
              <TabsTrigger value="faq">How It Works</TabsTrigger>
            </TabsList>
            
            <TabsContent value="share" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Share Your Referral Link</CardTitle>
                  <CardDescription>
                    Share this unique link with friends to earn bonus Spark Points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      value={referralLink}
                      readOnly
                      className="pr-24 bg-muted/50"
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1 h-8"
                      onClick={handleCopyLink}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <span>or</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="friend@example.com"
                      type="email"
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSendReferral}>
                      Send Invitation
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-6">
                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => {
                      const text = `Join me on our platform using my referral link: ${referralLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                      </svg>
                      WhatsApp
                    </Button>
                    
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => {
                      const text = `Join me on our platform using my referral link: ${referralLink}`;
                      window.open(`https://telegram.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`);
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                      </svg>
                      Telegram
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Bonus Points</AlertTitle>
                <AlertDescription>
                  When your referral signs up, you'll both receive 10 Spark Points!
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral History</CardTitle>
                  <CardDescription>
                    Track the status of your referrals and earned bonuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referrals && referrals.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Bonus Earned</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="font-medium">{referral.username}</TableCell>
                            <TableCell>{referral.date}</TableCell>
                            <TableCell>
                              {referral.status === "completed" ? (
                                <Badge variant="success" className="bg-green-500">Completed</Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {referral.bonusEarned > 0 ? (
                                <span className="font-medium text-green-600">+{referral.bonusEarned} SP</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                      <p className="text-muted-foreground">
                        Share your referral link to start earning bonus points!
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => document.getElementById("share-tab")?.click()}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>How Our Referral Program Works</CardTitle>
                  <CardDescription>
                    Learn about the benefits and process of our referral system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Invite Friends</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Share your unique referral link with friends via email, WhatsApp, or social media.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ArrowUpRight className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Friends Sign Up</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        When your friends use your link to sign up, their account will be linked to yours.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Confirmation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Once they complete the registration process, the referral is confirmed.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Earn Rewards</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Both you and your friend receive 10 Spark Points each as a bonus.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/40 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Terms and Conditions</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Bonus points are awarded only when a referred user completes registration</li>
                      <li>Each referral can only be counted once</li>
                      <li>The referral bonus is 10 Spark Points for both the referrer and the referred user</li>
                      <li>We reserve the right to modify or terminate the referral program at any time</li>
                      <li>Fraudulent referrals will result in forfeiture of all bonuses</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Referral;
