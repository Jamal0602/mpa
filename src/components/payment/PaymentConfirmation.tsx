
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

export interface PaymentConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  amount: number | string;
  currency?: string;
  itemName: string;
}

export const PaymentConfirmation = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  amount,
  currency = '₹',
  itemName,
}: PaymentConfirmationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onConfirm();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{success ? 'Payment Successful' : title}</DialogTitle>
          <DialogDescription>
            {success ? 'Your payment has been processed successfully.' : description}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <p className="mt-4 text-center text-sm font-medium">
              Thank you for your purchase!
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{itemName}</span>
                  <span className="font-bold">{currency}{amount}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
