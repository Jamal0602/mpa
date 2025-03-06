
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LoadingPage } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { SubscriptionPlan as SubscriptionPlanComponent } from "@/components/subscription/SubscriptionPlan";
import { CustomAmountForm } from "@/components/subscription/CustomAmountForm";
import { subscriptionPlans } from "@/components/subscription/SubscriptionData";
import { SubscriptionPlan } from "@/components/subscription/SubscriptionData";
import { PaymentProcessor } from "@/components/subscription/PaymentProcessor";

const Subscription = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [customAmount, setCustomAmount] = useState<number | "">("");
  
  const { data: profile, isLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["profile-subscription", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("key_points")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  if (isLoading) return <LoadingPage />;
  
  const handlePaymentComplete = () => {
    setSelectedPlan(null);
    setCustomAmount("");
    refetchProfile();
  };
  
  return (
    <PageLayout
      title="Spark Points Subscription"
      description="Fuel your projects with Spark Points, our virtual currency for uploads, premium content, and more."
      requireAuth={true}
    >
      <div className="text-center space-y-4 mb-8">
        <div className="bg-primary/10 inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium">Current Balance: {profile?.key_points || 0} Spark Points</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {subscriptionPlans.map((plan) => (
          <SubscriptionPlanComponent
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan?.id === plan.id}
            onSelect={(plan) => {
              setSelectedPlan(plan);
              setCustomAmount("");
            }}
          />
        ))}
      </div>
      
      <Card className="bg-muted/30 mb-8">
        <CardHeader>
          <CardTitle>Custom Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomAmountForm
            value={customAmount}
            onChange={setCustomAmount}
            onPlanSelected={() => setSelectedPlan(null)}
          />
        </CardContent>
      </Card>
      
      {user && (
        <PaymentProcessor 
          userId={user.id}
          selectedPlan={selectedPlan}
          customAmount={customAmount}
          currentPoints={profile?.key_points || 0}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      <div className="flex items-center justify-center text-sm text-muted-foreground space-x-2">
        <Shield className="h-4 w-4" />
        <span>Secure payment processing</span>
      </div>
    </PageLayout>
  );
};

export default Subscription;
