import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, CreditCard, Sparkles, TrendingUp, Shield, AlertCircle, Copy, ArrowRight, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  points: number;
  bonus: number;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 100,
    points: 100,
    bonus: 5,
    features: [
      "105 Spark Points",
      "Standard usage limits",
      "Email support"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: 500,
    points: 500,
    bonus: 20,
    popular: true,
    features: [
      "520 Spark Points",
      "Increased usage limits",
      "Priority email support",
      "Access to premium projects"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 1000,
    points: 1000,
    bonus: 50,
    features: [
      "1050 Spark Points",
      "Unlimited usage",
      "Priority support",
      "Access to premium projects",
      "Early access to new features"
    ]
  }
];

const UPI_ID = "ja.jamalasraf@fam";

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [verificationError, setVerificationError] = useState("");
  
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
  
  if (!user) {
    navigate("/auth");
    return null;
  }

  const calculateCustomPoints = (amount: number) => {
    if (amount >= 1000) return Math.floor(amount * 1.05);  // 5% bonus for 1000+
    else if (amount >= 500) return Math.floor(amount * 1.04);  // 4% bonus for 500+
    else if (amount >= 100) return Math.floor(amount * 1.03);  // 3% bonus for 100+
    else return amount;  // No bonus for smaller amounts
  };
  
  const handleStartPayment = () => {
    if (!selectedPlan && (!customAmount || customAmount < 1)) {
      toast.error("Please select a plan or enter a custom amount");
      return;
    }
    
    setVerificationError("");
    setShowPaymentDialog(true);
  };
  
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID copied to clipboard");
  };
  
  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      setVerificationError("Please enter a transaction ID");
      return;
    }
    
    setIsPaymentProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isPaymentVerified = !transactionId.toUpperCase().includes("FAIL");
      
      if (!isPaymentVerified) {
        setVerificationError("Payment verification failed. Please enter a valid transaction ID or report this issue.");
        throw new Error("Payment could not be verified");
      }
      
      const amount = selectedPlan ? selectedPlan.points + selectedPlan.bonus : calculateCustomPoints(Number(customAmount));
      const price = selectedPlan ? selectedPlan.price : Number(customAmount);
      const planName = selectedPlan ? selectedPlan.name : "Custom";
      
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ 
          key_points: (profile?.key_points || 0) + amount 
        })
        .eq("id", user.id);
      
      if (pointsError) throw pointsError;
      
      await supabase
        .from("key_points_transactions")
        .insert({
          user_id: user.id,
          amount: amount,
          description: `Purchased ${planName} plan (₹${price}) - Transaction ID: ${transactionId}`,
          transaction_type: 'earn'
        });
      
      toast.success(`Successfully purchased ${amount} Spark Points!`);
      refetchProfile();
      setSelectedPlan(null);
      setCustomAmount("");
      setTransactionId("");
      setShowPaymentDialog(false);
      
    } catch (error: any) {
      if (!error.message.includes("verified")) {
        toast.error(`Purchase failed: ${error.message}`);
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Spark Points Subscription</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fuel your projects with Spark Points, our virtual currency for uploads, premium content, and more.
            </p>
            <div className="bg-primary/10 inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">Current Balance: {profile?.key_points || 0} Spark Points</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all ${
                  selectedPlan?.id === plan.id 
                    ? "border-primary" 
                    : "hover:border-primary/40"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{plan.name}</span>
                    {plan.bonus > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        +{plan.bonus} Bonus
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {plan.points + plan.bonus} Spark Points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-5">
                    ₹{plan.price}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedPlan(plan)}
                    variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                    disabled={isPaymentProcessing}
                  >
                    {selectedPlan?.id === plan.id ? "Selected" : "Select"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Custom Amount</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="custom-amount">Enter Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    className="pl-6"
                    value={customAmount}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : Number(e.target.value);
                      setCustomAmount(value);
                      setSelectedPlan(null);
                    }}
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>
              <div className="flex-1 bg-primary/5 p-4 rounded-md">
                <div className="text-sm text-muted-foreground mb-2">You'll receive:</div>
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  <span className="text-xl font-bold">
                    {customAmount 
                      ? `${calculateCustomPoints(Number(customAmount))} Spark Points` 
                      : "0 Spark Points"}
                  </span>
                </div>
                {customAmount && Number(customAmount) >= 100 && (
                  <div className="mt-2 text-xs text-primary flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Includes bonus points!
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleStartPayment}
              disabled={isPaymentProcessing || (!selectedPlan && (!customAmount || Number(customAmount) < 1))}
              className="min-w-[200px]"
            >
              {isPaymentProcessing ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center text-sm text-muted-foreground space-x-2">
            <Shield className="h-4 w-4" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
            <DialogDescription>
              Follow these steps to complete your purchase
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <Alert className="bg-muted">
              <AlertTitle className="flex items-center gap-2">
                <span>UPI Payment Details</span>
                <Badge variant="outline">Preferred</Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <div className="bg-primary/5 p-3 rounded-md flex items-center justify-between">
                    <code className="font-mono font-semibold">{UPI_ID}</code>
                    <Button variant="ghost" size="sm" onClick={handleCopyUpiId}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy UPI ID</span>
                    </Button>
                  </div>
                  <ol className="space-y-2 text-sm list-decimal pl-4">
                    <li>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                    <li>Send payment to the UPI ID above</li>
                    <li>Use amount: ₹{selectedPlan ? selectedPlan.price : customAmount}</li>
                    <li>Copy the UPI Transaction ID after payment</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-id">UPI Transaction ID</Label>
              <Input
                id="transaction-id"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your transaction ID"
                className={verificationError ? "border-destructive" : ""}
              />
              {verificationError && (
                <div className="text-destructive text-sm flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{verificationError}</span>
                  <Button 
                    variant="link" 
                    className="text-sm h-auto p-0 ml-1" 
                    onClick={() => navigate("/help")}
                  >
                    Get help
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                For demo purposes: Any transaction ID without "FAIL" will be verified successfully.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              disabled={isPaymentProcessing}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Link to="/help">
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Need help?
                </Button>
              </Link>
              <Button 
                onClick={handleVerifyPayment} 
                disabled={isPaymentProcessing || !transactionId.trim()}
              >
                {isPaymentProcessing ? "Verifying..." : (
                  <>
                    Verify Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
