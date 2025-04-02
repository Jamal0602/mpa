
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

// Payment method options
const PAYMENT_METHODS = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: <CreditCard className="h-4 w-4" />,
    requiresVerification: false
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <Download className="h-4 w-4" />,
    requiresVerification: true
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: <CreditCard className="h-4 w-4" />,
    requiresVerification: true
  }
];

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  
  const getAmount = () => selectedPlan ? selectedPlan.price : Number(customAmount);
  const getPoints = () => selectedPlan 
    ? selectedPlan.points + selectedPlan.bonus 
    : calculateCustomPoints(Number(customAmount));
  const getPlanName = () => selectedPlan ? selectedPlan.name : "Custom";
  
  const currentPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
  
  const handlePurchase = () => {
    if (!selectedPlan && (!customAmount || customAmount < 1)) {
      toast.error("Please select a plan or enter a custom amount");
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
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
      const requiresVerification = currentPaymentMethod?.requiresVerification || false;
      
      // Record transaction in payment_transactions table
      const { data: paymentTx, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          amount: price,
          currency: 'INR',
          spark_points: amount,
          payment_method: selectedPaymentMethod,
          status: requiresVerification ? 'pending' : 'completed',
          verification_status: requiresVerification ? 'unverified' : 'verified'
        })
        .select()
        .single();
        
      if (txError) throw txError;
      
      // For methods requiring verification, show verification modal
      if (requiresVerification) {
        setTransactionId(paymentTx.id);
        setShowVerificationModal(true);
        toast.info("Please complete payment verification to receive Spark Points");
      } else {
        // For instant payment methods like credit cards
        // Update user's key points
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            key_points: (currentPoints || 0) + amount 
          })
          .eq('id', userId);
        
        if (pointsError) throw pointsError;
        
        // Record point transaction
        await supabase
          .from('key_points_transactions')
          .insert({
            user_id: userId,
            amount: amount,
            description: `Purchased ${planName} plan (₹${price})`,
            transaction_type: 'earn'
          });
          
        toast.success(`Successfully purchased ${amount} Spark Points!`);
        onPaymentComplete();
      }
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
        <div className="space-y-2">
          <label htmlFor="payment-method" className="text-sm font-medium">
            Payment Method
          </label>
          <Select
            value={selectedPaymentMethod}
            onValueChange={setSelectedPaymentMethod}
          >
            <SelectTrigger id="payment-method" className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    {method.icon}
                    <span>{method.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentPaymentMethod?.requiresVerification && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Verification Required</h4>
              <p className="text-sm">
                This payment method requires verification. After completing your purchase, 
                you'll need to provide payment details for verification. 
                Spark Points will be credited after admin verification.
              </p>
            </div>
          </Alert>
        )}
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
              Complete Purchase
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
