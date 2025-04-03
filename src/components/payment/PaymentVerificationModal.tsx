
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
import { Check, Download, Copy, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

interface PaymentVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reference: string) => void;
  paymentMethod: string;
}

interface PaymentDetails {
  upiId: string;
  qrCode: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  accountHolder?: string;
}

const PAYMENT_DETAILS: Record<string, PaymentDetails> = {
  upi: {
    upiId: "ja.jamalasraf@fam",
    qrCode: "/placeholder.svg"
  },
  bankTransfer: {
    accountNumber: "3614879023",
    ifscCode: "SBIN0015623",
    bankName: "State Bank of India",
    accountHolder: "Jamal Asraf",
    qrCode: "/placeholder.svg"
  }
};

export function PaymentVerificationModal({
  open,
  onClose,
  onConfirm,
  paymentMethod = 'upi'
}: PaymentVerificationModalProps) {
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  
  // Get the appropriate payment details based on the selected method
  const paymentDetails = PAYMENT_DETAILS[paymentMethod] || PAYMENT_DETAILS.upi;
  const isUpi = paymentMethod === 'upi';
  
  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      setError("Please enter transaction/reference ID");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      setTimeout(() => {
        onConfirm(transactionId);
        setPaymentSubmitted(true);
        setIsSubmitting(false);
      }, 1500);
    } catch (error: any) {
      setIsSubmitting(false);
      setError(error.message || "Failed to submit payment verification");
    }
  };
  
  const resetForm = () => {
    setTransactionId('');
    setNotes('');
    setError(null);
    setPaymentSubmitted(false);
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = paymentDetails.qrCode;
    link.download = `${paymentMethod}-payment-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully');
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        {!paymentSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {isUpi ? 'UPI Payment Verification' : 'Bank Transfer Verification'}
              </DialogTitle>
              <DialogDescription>
                Pay the exact amount to the {isUpi ? 'UPI ID' : 'bank account'} below, then provide your transaction reference ID.
              </DialogDescription>
            </DialogHeader>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {isUpi ? 'UPI Payment Details' : 'Bank Transfer Details'}
                </CardTitle>
                <CardDescription>
                  {isUpi 
                    ? 'Scan the QR code or pay using the UPI ID' 
                    : 'Transfer to this account and provide the reference ID'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {/* QR Code */}
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                  <img src={paymentDetails.qrCode} alt="Payment QR Code" className="w-40 h-40" />
                </div>
                
                {/* Payment Details */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {isUpi && (
                    <>
                      <div className="text-sm font-medium">UPI ID</div>
                      <div className="flex justify-between">
                        <div className="text-sm">{paymentDetails.upiId}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => copyToClipboard(paymentDetails.upiId, "UPI ID")}
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {!isUpi && (
                    <>
                      <div className="text-sm font-medium">Account Number</div>
                      <div className="flex justify-between">
                        <div className="text-sm">{paymentDetails.accountNumber}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => copyToClipboard(paymentDetails.accountNumber || "", "Account Number")}
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                      
                      <div className="text-sm font-medium">IFSC Code</div>
                      <div className="flex justify-between">
                        <div className="text-sm">{paymentDetails.ifscCode}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => copyToClipboard(paymentDetails.ifscCode || "", "IFSC Code")}
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                      
                      <div className="text-sm font-medium">Bank Name</div>
                      <div className="text-sm">{paymentDetails.bankName}</div>
                      
                      <div className="text-sm font-medium">Account Holder</div>
                      <div className="text-sm">{paymentDetails.accountHolder}</div>
                    </>
                  )}
                </div>
                
                {/* Download QR Code button */}
                <Button 
                  className="w-full flex items-center justify-center" 
                  size="sm"
                  onClick={downloadQRCode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </CardContent>
            </Card>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-id">Transaction Reference ID</Label>
                <Input
                  id="transaction-id"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    setError(null);
                  }}
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
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Payment Verification Submitted</DialogTitle>
              <DialogDescription>
                Your payment verification has been submitted successfully.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center py-6 space-y-4">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
                <Check className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Thank you!</h3>
                <p className="text-sm text-muted-foreground">
                  Your transaction reference ({transactionId}) has been recorded. Our team will verify your payment shortly.
                </p>
              </div>
            </div>
            
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Having issues with your payment? <Link to="/error-report" className="font-medium underline">Report a problem</Link>
              </AlertDescription>
            </Alert>
            
            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
