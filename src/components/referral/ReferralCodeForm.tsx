
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface ReferralCodeFormProps {
  userId: string;
  onSuccess: () => void;
}

export const ReferralCodeForm = ({ userId, onSuccess }: ReferralCodeFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [referredCode, setReferredCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReferralCode = async () => {
    if (!referredCode || referredCode.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a valid referral code",
        variant: "destructive",
      });
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

    try {
      // Check if user already used a referral code
      const { data: profileData } = await supabase
        .from('profiles')
        .select('referred_by')
        .eq('id', userId)
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

      if (referrerData.id === userId) {
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
        referred_user_id: userId,
        referrer_code: referredCode
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Referral code applied successfully. You've earned 10 Spark Points!",
      });
      
      // Refresh data
      onSuccess();
      setReferredCode("");
      
    } catch (error: any) {
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
    </Card>
  );
};
