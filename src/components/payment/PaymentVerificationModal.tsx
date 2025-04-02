
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, Download, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reference: string) => void;
  paymentMethod: string;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

interface UpiDetails {
  upiId: string;
  qrCode: string;
}

const BANK_DETAILS: BankDetails = {
  accountName: "Multi Project Association",
  accountNumber: "1234567890123456",
  ifsc: "SBIN0000123",
  bankName: "State Bank of India"
};

const UPI_DETAILS: UpiDetails = {
  upiId: "mpa@ybl",
  qrCode: "/placeholder.svg"
};

export function PaymentVerificationModal({
  open,
  onClose,
  onConfirm,
  paymentMethod
}: PaymentVerificationModalProps) {
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction/reference ID");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this might include uploading receipt images etc.
      setTimeout(() => {
        onConfirm(transactionId);
        resetForm();
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Failed to submit payment verification");
    }
  };
  
  const resetForm = () => {
    setTransactionId('');
    setNotes('');
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Verification</DialogTitle>
          <DialogDescription>
            Complete your payment using the details below, then provide your transaction reference ID.
          </DialogDescription>
        </DialogHeader>
        
        {paymentMethod === 'bank_transfer' && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer Details</CardTitle>
              <CardDescription>Transfer the exact amount to this account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Account Name</div>
                <div className="flex justify-between">
                  <div className="text-sm">{BANK_DETAILS.accountName}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => copyToClipboard(BANK_DETAILS.accountName, "Account name")}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Account Number</div>
                <div className="flex justify-between">
                  <div className="text-sm">{BANK_DETAILS.accountNumber}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, "Account number")}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">IFSC Code</div>
                <div className="flex justify-between">
                  <div className="text-sm">{BANK_DETAILS.ifsc}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => copyToClipboard(BANK_DETAILS.ifsc, "IFSC code")}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Bank Name</div>
                <div className="text-sm">{BANK_DETAILS.bankName}</div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {paymentMethod === 'upi' && (
          <Card>
            <CardHeader>
              <CardTitle>UPI Payment Details</CardTitle>
              <CardDescription>Scan the QR code or pay using the UPI ID</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                <img src={UPI_DETAILS.qrCode} alt="UPI QR Code" className="w-40 h-40" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="text-sm font-medium">UPI ID</div>
                <div className="flex justify-between">
                  <div className="text-sm">{UPI_DETAILS.upiId}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => copyToClipboard(UPI_DETAILS.upiId, "UPI ID")}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                className="w-full flex items-center justify-center" 
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-id">Transaction Reference ID</Label>
            <Input
              id="transaction-id"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction/UTR number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about your payment"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !transactionId.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Verify Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
