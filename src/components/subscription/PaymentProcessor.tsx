
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { SubscriptionPlan } from "@/components/subscription/SubscriptionData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentVerificationModal } from "@/components/payment/PaymentVerificationModal";

export interface PaymentProcessorProps {
  amount: number;
  calculatedPoints: number;
  onSuccess: () => void;
}

export function PaymentProcessor({ amount, calculatedPoints, onSuccess }: PaymentProcessorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<"upi">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSaveMethod, setIsSaveMethod] = useState(false);
  const [isSavedMethod, setIsSavedMethod] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  
  // UPI details
  const [upiDetails, setUpiDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolder: "",
    qrCode: "",
    upiId: "ja.jamalasraf@fam"
  });
  
  const handlePaymentSubmit = async () => {
    setVerificationModalOpen(true);
  };
  
  const handlePaymentConfirmation = async (transactionId: string) => {
    setSubmitting(true);
    
    try {
      // Create a payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from("payment_transactions")
        .insert({
          user_id: user.id,
          amount: amount,
          spark_points: calculatedPoints,
          currency: "INR",
          payment_method: paymentMethod,
          payment_reference: transactionId,
          status: "pending",
          verification_status: "unverified"
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
      // Create the payment method if applicable
      if (paymentMethod === "upi" && !isSavedMethod && isSaveMethod) {
        await supabase
          .from("payment_methods")
          .insert({
            user_id: user.id,
            payment_type: paymentMethod,
            upi_id: upiDetails.upiId,
            is_default: isSaveMethod,
            payment_details: {}
          })
      }
      
      toast.success("Payment submitted for verification", {
        description: "Your payment is under review. Spark Points will be added to your account after verification."
      });
      
      onSuccess();
      setPaymentDialogOpen(false);
      navigate("/account");
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(`Payment failed: ${error.message || "Please try again"}`);
      toast.error("Payment failed", {
        description: error.message || "Please try again later"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <>
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default">
            Add Spark Points
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Submit your payment details to purchase {calculatedPoints} Spark Points.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-4">
              <div>
                <h4 className="font-medium text-sm">Amount</h4>
                <p className="text-muted-foreground">₹{amount} INR</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm">Spark Points</h4>
                <p className="text-muted-foreground">{calculatedPoints} SP</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value: "upi") => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveMethod"
                checked={isSaveMethod}
                onCheckedChange={(checked) => setIsSaveMethod(checked === true)}
              />
              <label
                htmlFor="saveMethod"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Save payment method
              </label>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit}>
              Proceed to Pay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <PaymentVerificationModal
        open={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onConfirm={handlePaymentConfirmation}
        paymentMethod={paymentMethod}
        amount={amount}
      />
    </>
  );
}
