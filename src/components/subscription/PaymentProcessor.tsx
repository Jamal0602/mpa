import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PaymentDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolder: string;
  qrCode: string;
  upiId: string; // Add this missing property
}

interface PaymentProcessorProps {
  amount: number;
  calculatedPoints: number;
  onSuccess: () => void;
}

export function PaymentProcessor({ amount, calculatedPoints, onSuccess }: PaymentProcessorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "upi">("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSaveMethod, setIsSaveMethod] = useState(false);
  const [isSavedMethod, setIsSavedMethod] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // Bank transfer details
  const [bankDetails, setBankDetails] = useState<PaymentDetails>({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolder: "",
    qrCode: "",
    upiId: ""
  });
  
  // UPI details
  const [upiDetails, setUpiDetails] = useState<PaymentDetails>({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolder: "",
    qrCode: "",
    upiId: ""
  });
  
  const handlePaymentSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Validate form fields
      if (!transactionId) {
        setError("Please enter the transaction ID");
        return;
      }
      
      if (paymentMethod === "bank_transfer") {
        if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.accountHolder) {
          setError("Please fill in all bank details");
          return;
        }
      } else if (paymentMethod === "upi") {
        if (!upiDetails.upiId) {
          setError("Please enter your UPI ID");
          return;
        }
      }
      
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
      if (paymentMethod === "bank_transfer" && !isSavedMethod) {
        await supabase
          .from("payment_methods")
          .insert({
            user_id: user.id,
            payment_type: paymentMethod,
            account_number: bankDetails.accountNumber,
            ifsc_code: bankDetails.ifscCode,
            account_holder: bankDetails.accountHolder,
            bank_name: bankDetails.bankName,
            is_default: isSaveMethod
          })
          .then(({ error }) => {
            if (error) console.error("Error saving payment method:", error);
          })
          .catch(error => {
            console.error("Error in payment method save:", error);
          });
      } else if (paymentMethod === "upi" && !isSavedMethod) {
        await supabase
          .from("payment_methods")
          .insert({
            user_id: user.id,
            payment_type: paymentMethod,
            upi_id: upiDetails.upiId,
            is_default: isSaveMethod
          })
          .then(({ error }) => {
            if (error) console.error("Error saving payment method:", error);
          })
          .catch(error => {
            console.error("Error in payment method save:", error);
          });
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
              <p className="text-muted-foreground">{amount} INR</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">Spark Points</h4>
              <p className="text-muted-foreground">{calculatedPoints} SP</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select onValueChange={setPaymentMethod} defaultValue={paymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
          
          {paymentMethod === "bank_transfer" && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Bank Details</h4>
              <Input
                id="accountNumber"
                placeholder="Account Number"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              />
              <Input
                id="ifscCode"
                placeholder="IFSC Code"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
              />
              <Input
                id="bankName"
                placeholder="Bank Name"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              />
              <Input
                id="accountHolder"
                placeholder="Account Holder Name"
                value={bankDetails.accountHolder}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
              />
            </div>
          )}
          
          {paymentMethod === "upi" && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">UPI Details</h4>
              <Input
                id="upiId"
                placeholder="UPI ID"
                value={upiDetails.upiId}
                onChange={(e) => setUpiDetails({ ...upiDetails, upiId: e.target.value })}
              />
            </div>
          )}
          
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
          <Button disabled={isSubmitting} onClick={handlePaymentSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
