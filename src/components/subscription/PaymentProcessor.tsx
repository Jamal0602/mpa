
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentConfirmation } from '@/components/payment/PaymentConfirmation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CreditCard, Download, AlertCircle } from 'lucide-react';
import { SubscriptionPlan } from '@/components/subscription/SubscriptionData';
import { calculateCustomPoints } from '@/components/subscription/SubscriptionData';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentVerificationModal } from '@/components/payment/PaymentVerificationModal';
import { Alert } from '@/components/ui/alert';

interface PaymentProcessorProps {
  userId: string;
  selectedPlan: SubscriptionPlan | null;
  customAmount: number | "";
  currentPoints: number;
  onPaymentComplete: () => void;
}

export const PaymentProcessor = ({
  userId,
  selectedPlan,
  customAmount,
  currentPoints,
  onPaymentComplete
}: PaymentProcessorProps) => {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  // Only UPI is allowed as per requirements
  const selectedPaymentMethod = 'upi';
  
  const getAmount = () => selectedPlan ? selectedPlan.price : Number(customAmount);
  const getPoints = () => selectedPlan 
    ? selectedPlan.points + selectedPlan.bonus 
    : calculateCustomPoints(Number(customAmount));
  const getPlanName = () => selectedPlan ? selectedPlan.name : "Custom";
  
  const handlePurchase = () => {
    if (!selectedPlan && (!customAmount || customAmount < 1)) {
      toast.error("Please select a plan or enter a custom amount");
      return;
    }
    
    setShowPaymentConfirmation(true);
  };
  
  const processPayment = async () => {
    setIsPaymentProcessing(true);
    
    try {
      const amount = getPoints();
      const price = getAmount();
      const planName = getPlanName();
      
      // Record transaction in payment_transactions table
      const { data: paymentTx, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          amount: price,
          currency: 'INR',
          spark_points: amount,
          payment_method: selectedPaymentMethod,
          status: 'pending',
          verification_status: 'unverified'
        })
        .select()
        .single();
        
      if (txError) throw txError;
      
      setTransactionId(paymentTx.id);
      setShowVerificationModal(true);
      toast.info("Please complete payment verification to receive Spark Points");
      
    } catch (error: any) {
      toast.error(`Purchase failed: ${error.message}`);
    } finally {
      setIsPaymentProcessing(false);
      setShowPaymentConfirmation(false);
    }
  };
  
  const handleVerificationComplete = (reference: string) => {
    setShowVerificationModal(false);
    
    // Update payment reference
    if (transactionId) {
      supabase
        .from('payment_transactions')
        .update({
          payment_reference: reference
        })
        .eq('id', transactionId)
        .then(() => {
          toast.success("Payment verification submitted successfully");
          toast.info("Your payment will be verified by an administrator shortly");
        })
        .catch(error => {
          toast.error(`Error updating reference: ${error.message}`);
        });
    }
    
    onPaymentComplete();
  };
  
  return (
    <>
      <div className="mb-6 space-y-4">
        <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-500">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Payment Instructions</h4>
            <p className="text-sm">
              UPI payments only. Please make payment to <strong>ja.jamalasraf@fam</strong> 
              using Google Pay or any UPI platform. After payment, submit your transaction
              reference ID for verification.
            </p>
          </div>
        </Alert>
      </div>
      
      <div className="flex justify-center mb-4">
        <Button 
          size="lg" 
          onClick={handlePurchase}
          disabled={isPaymentProcessing || (!selectedPlan && (!customAmount || Number(customAmount) < 1))}
          className="min-w-[200px]"
        >
          {isPaymentProcessing ? (
            "Processing..."
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ₹{getAmount()} with UPI
            </>
          )}
        </Button>
      </div>
      
      <PaymentConfirmation
        open={showPaymentConfirmation}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={processPayment}
        title="Confirm Purchase"
        description="Please confirm your Spark Points purchase"
        amount={getAmount()}
        itemName={`${getPlanName()} Plan (${getPoints()} Spark Points)`}
      />
      
      <PaymentVerificationModal
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onConfirm={handleVerificationComplete}
        paymentMethod={selectedPaymentMethod}
      />
    </>
  );
};
