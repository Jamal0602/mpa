
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { checkUserBalance, deductPoints } from '@/components/auth/ProfileService';
import { toast } from 'sonner';

interface PaymentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  serviceName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentConfirmationModal = ({
  open,
  onOpenChange,
  amount,
  serviceName,
  onSuccess,
  onCancel
}: PaymentConfirmationModalProps) => {
  const { user, refreshProfile } = useAuth();
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!user) {
      toast.error("You must be logged in to make a purchase");
      onOpenChange(false);
      return;
    }

    try {
      setProcessing(true);
      
      // Check if user has enough points
      const hasEnoughPoints = await checkUserBalance(user.id, amount);
      
      if (!hasEnoughPoints) {
        toast.error("You don't have enough points for this purchase. Please add more points to your account.");
        onOpenChange(false);
        onCancel();
        return;
      }
      
      // Deduct points
      const success = await deductPoints(
        user.id, 
        amount, 
        `Payment for ${serviceName}`
      );
      
      if (!success) {
        throw new Error("Failed to process payment");
      }
      
      // Refresh the user profile to update points
      await refreshProfile();
      
      toast.success(`Successfully purchased ${serviceName} for ${amount} points`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(`Payment failed: ${error.message}`);
      onCancel();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to spend <span className="font-semibold">{amount} points</span> for {serviceName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-3">
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Points will be deducted immediately</p>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. Please confirm to proceed.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center gap-2 sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              onCancel();
            }}
            disabled={processing}
            className="flex-1"
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="flex-1" 
            disabled={processing}
          >
            {processing ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-1 h-4 w-4" />
            )}
            {processing ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;
