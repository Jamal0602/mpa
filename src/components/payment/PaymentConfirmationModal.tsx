
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  amount: number;
  serviceName: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

export function PaymentConfirmationModal({
  open,
  title,
  description,
  amount,
  serviceName,
  onClose,
  onConfirm,
}: PaymentConfirmationModalProps) {
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const result = await onConfirm();
      
      if (result) {
        setSuccess(true);
        // Auto close after success
        setTimeout(() => {
          setSuccess(false);
          setProcessing(false);
          onClose();
        }, 2000);
      } else {
        setError("Transaction failed. Please try again.");
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || "Transaction failed. Please try again.");
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const currentBalance = profile?.key_points || 0;
  const insufficientFunds = currentBalance < amount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="text-sm font-medium">Service:</div>
            <div>{serviceName}</div>
          </div>
          
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="text-sm font-medium">Cost:</div>
            <div>{amount} Spark Points</div>
          </div>
          
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="text-sm font-medium">Current Balance:</div>
            <div>{currentBalance} Spark Points</div>
          </div>
          
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="text-sm font-medium">New Balance:</div>
            <div>{currentBalance - amount} Spark Points</div>
          </div>
          
          {insufficientFunds && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>Insufficient funds. Please add more Spark Points.</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Payment successful!</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={processing || insufficientFunds || success}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
