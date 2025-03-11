
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentConfirmation } from '@/components/payment/PaymentConfirmation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import { SubscriptionPlan } from '@/components/subscription/SubscriptionData';
import { calculateCustomPoints } from '@/components/subscription/SubscriptionData';

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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amount = getPoints();
      const price = getAmount();
      const planName = getPlanName();
      
      // Update user's key points
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ 
          key_points: (currentPoints || 0) + amount 
        })
        .eq("id", userId);
      
      if (pointsError) throw pointsError;
      
      // Record transaction
      await supabase
        .from("key_points_transactions")
        .insert({
          user_id: userId,
          amount: amount,
          description: `Purchased ${planName} plan (₹${price})`,
          transaction_type: 'earn'
        });
      
      toast.success(`Successfully purchased ${amount} Spark Points!`);
      onPaymentComplete();
      
    } catch (error: any) {
      toast.error(`Purchase failed: ${error.message}`);
      throw error;
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  return (
    <>
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
    </>
  );
};
