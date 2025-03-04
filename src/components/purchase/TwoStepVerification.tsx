
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TwoStepVerificationProps {
  userId: string;
  purchaseDetails: {
    amount: number;
    description: string;
  };
  onVerified: () => void;
  onCancel: () => void;
}

export const TwoStepVerification = ({ 
  userId, 
  purchaseDetails, 
  onVerified, 
  onCancel 
}: TwoStepVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const handleSendCode = async () => {
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      
      // Get user email
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      // In a real app, you would send an email here
      // For this demo, we'll just show the code in a toast
      toast.success(`Verification code sent to ${userData.user.email}`, {
        description: `Your code is: ${code}`,
        duration: 10000,
      });
      
      setIsCodeSent(true);
      
      // Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Verification Code Sent",
        message: `A verification code has been sent for your purchase of ${purchaseDetails.amount} Spark Points. The code is: ${code}`,
        type: "info"
      });
      
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code");
    }
  };
  
  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Check if code matches
      if (verificationCode === generatedCode) {
        toast.success("Verification successful!", {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        
        // Proceed with the purchase
        onVerified();
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Step Verification</CardTitle>
        <CardDescription>
          Verify your purchase of {purchaseDetails.amount} Spark Points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Purchase Summary</h3>
          <p className="text-sm">Amount: {purchaseDetails.amount} Spark Points</p>
          <p className="text-sm">Description: {purchaseDetails.description}</p>
        </div>
        
        {!isCodeSent ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-center">
              To proceed with this purchase, we need to verify your identity.
              Click the button below to receive a verification code.
            </p>
            <Button onClick={handleSendCode} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send Verification Code
            </Button>
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Verification Code</label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                A verification code has been sent to your email address.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={handleVerify} disabled={isVerifying || !verificationCode}>
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={handleSendCode} className="text-xs">
                Resend Code
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
