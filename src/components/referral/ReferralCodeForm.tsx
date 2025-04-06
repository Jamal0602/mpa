
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Gift, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReferralCodeFormProps {
  userId: string;
  onSuccess: () => void;
}

export const ReferralCodeForm = ({ userId, onSuccess }: ReferralCodeFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referredCode, setReferredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submitReferralCode = async () => {
    if (!referredCode || referredCode.trim() === "") {
      setError("Please enter a valid referral code");
      return;
    }

    if (!userId) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to use a referral code",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Check if user already used a referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (profileData && profileData.referred_by) {
        setError("You've already used a referral code");
        return;
      }

      // Check if the referral code exists and is not the user's own code
      const { data: referrerData } = await supabase
        .from('profiles')
        .select('id, referral_code')
        .eq('referral_code', referredCode)
        .single();

      if (!referrerData) {
        setError("This referral code doesn't exist");
        return;
      }

      if (referrerData.id === userId) {
        setError("You cannot use your own referral code");
        return;
      }

      // Call the process_referral_bonus function
      const { data, error } = await supabase.rpc('process_referral_bonus', {
        referred_user_id: userId,
        referrer_code: referredCode
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Referral code applied successfully. You've earned 10 Spark Points!",
      });
      
      setSuccess(true);
      
      // Refresh data
      onSuccess();
      setReferredCode("");
      
    } catch (error: any) {
      console.error("Error processing referral:", error);
      setError(error.message || "Failed to process referral. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Enter a Referral Code
        </CardTitle>
        <CardDescription>
          Got a referral code from a friend? Enter it here to get 10 Spark Points!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Gift className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Referral Successful!</h3>
            <p className="text-muted-foreground">
              You've been awarded 10 Spark Points. Your friend will also receive 10 Spark Points as a thank you.
            </p>
            <Button 
              onClick={() => navigate("/subscription")} 
              className="mt-4 gap-2"
            >
              Check your points <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="referred-code">Referral Code</Label>
              <Input 
                id="referred-code" 
                placeholder="Enter referral code" 
                value={referredCode}
                onChange={(e) => {
                  setReferredCode(e.target.value);
                  setError("");
                }}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium">How it works:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Enter a friend's referral code</li>
                <li>You receive 10 Spark Points</li>
                <li>Your friend gets 10 Spark Points</li>
                <li>Share your code to earn more</li>
              </ul>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                View Terms and Conditions <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </>
        )}
      </CardContent>
      {!success && (
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={submitReferralCode}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : "Apply Code"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
