
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Check, 
  Download, 
  Copy, 
  Loader2, 
  AlertCircle, 
  AlertTriangle,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaymentVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reference: string) => void;
  paymentMethod: string;
  amount?: number;
}

interface PaymentDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolder: string;
  qrCode: string;
  upiId: string;
}

interface UpiApp {
  name: string;
  logo: string;
  color: string;
  deepLink: (upiId: string, amount: number, note: string) => string;
}

const UPI_APPS: UpiApp[] = [
  {
    name: 'Google Pay',
    logo: '/gpay-logo.png',
    color: 'bg-white',
    deepLink: (upiId, amount, note) => 
      `gpay://upi/pay?pa=${upiId}&pn=JamalAsraf&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  },
  {
    name: 'PhonePe',
    logo: '/phonepe-logo.png',
    color: 'bg-purple-100',
    deepLink: (upiId, amount, note) => 
      `phonepe://pay?pa=${upiId}&pn=JamalAsraf&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  },
  {
    name: 'Paytm',
    logo: '/paytm-logo.png',
    color: 'bg-blue-100',
    deepLink: (upiId, amount, note) => 
      `paytmmp://pay?pa=${upiId}&pn=JamalAsraf&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  },
  {
    name: 'BHIM',
    logo: '/bhim-logo.png',
    color: 'bg-teal-100',
    deepLink: (upiId, amount, note) => 
      `upi://pay?pa=${upiId}&pn=JamalAsraf&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  },
  {
    name: 'Amazon Pay',
    logo: '/amazonpay-logo.png',
    color: 'bg-orange-100',
    deepLink: (upiId, amount, note) => 
      `amazonpay://pay?pa=${upiId}&pn=JamalAsraf&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  },
  {
    name: 'FamPay',
    logo: '/fampay-logo.png',
    color: 'bg-yellow-100',
    deepLink: (upiId, amount, note) => 
      `fampay://upi/pay?pa=${upiId}&pn=JamalAsraf&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  },
];

const PAYMENT_DETAILS: Record<string, PaymentDetails> = {
  upi: {
    upiId: "ja.jamalasraf@fam",
    qrCode: "/upi-qr.svg",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    accountHolder: ""
  },
  bankTransfer: {
    accountNumber: "3614879023",
    ifscCode: "SBIN0015623",
    bankName: "State Bank of India",
    accountHolder: "Jamal Asraf",
    qrCode: "/bank-qr.svg",
    upiId: ""
  }
};

export function PaymentVerificationModal({
  open,
  onClose,
  onConfirm,
  paymentMethod = 'upi',
  amount = 0
}: PaymentVerificationModalProps) {
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [autoVerifyStatus, setAutoVerifyStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [bonusPoints, setBonusPoints] = useState(0);
  
  const paymentDetails = PAYMENT_DETAILS[paymentMethod] || PAYMENT_DETAILS.upi;
  const isUpi = paymentMethod === 'upi';
  
  // Calculate bonus points (5% of amount)
  const calculateBonus = () => {
    if (amount >= 100) {
      return Math.floor(amount * 0.05);
    }
    return 0;
  };
  
  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      setError("Please enter transaction/reference ID");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Calculate bonus points before submission
      const bonus = calculateBonus();
      setBonusPoints(bonus);
      
      // First attempt auto-verification
      setAutoVerifyStatus('verifying');
      
      // Simulate verification check with a delay
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% chance of successful verification for demo
        
        if (success) {
          setAutoVerifyStatus('verified');
          onConfirm(transactionId);
          setPaymentSubmitted(true);
        } else {
          setAutoVerifyStatus('failed');
          // Continue with manual verification since auto-verification failed
          setTimeout(() => {
            onConfirm(transactionId);
            setPaymentSubmitted(true);
          }, 1000);
        }
        
        setIsSubmitting(false);
      }, 2000);
    } catch (error: any) {
      setIsSubmitting(false);
      setAutoVerifyStatus('failed');
      setError(error.message || "Failed to submit payment verification");
    }
  };
  
  const resetForm = () => {
    setTransactionId('');
    setNotes('');
    setError(null);
    setPaymentSubmitted(false);
    setAutoVerifyStatus('idle');
    setBonusPoints(0);
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

  const openUpiApp = (app: UpiApp) => {
    const paymentNote = `Payment for services - ${Date.now()}`;
    const deepLink = app.deepLink(paymentDetails.upiId, amount, paymentNote);
    
    // Try opening the app
    window.location.href = deepLink;
    
    // Set a note to help user remember which app they used
    setNotes(`Payment made using ${app.name}`);
    
    // Fallback for desktop or if app doesn't open
    setTimeout(() => {
      const fallbackNote = `If ${app.name} didn't open automatically, please manually open the app and send payment to ${paymentDetails.upiId}`;
      toast(fallbackNote, {
        duration: 5000
      });
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh]">
        <ScrollArea className="max-h-[75vh]">
          {!paymentSubmitted ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isUpi ? "UPI Payment" : "Bank Transfer"}
                </DialogTitle>
                <DialogDescription>
                  Pay ₹{amount.toFixed(2)} using {isUpi ? "any UPI app of your choice" : "bank transfer"}
                  {bonusPoints > 0 && (
                    <div className="mt-2 text-green-600 dark:text-green-400 font-medium">
                      Special Offer: Get {bonusPoints} bonus Spark Points!
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    Payment Options
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment app or scan the QR code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isUpi && (
                    <div className="grid grid-cols-3 gap-2">
                      {UPI_APPS.map(app => (
                        <Button 
                          key={app.name}
                          variant="outline" 
                          className={`flex flex-col items-center h-auto py-3 ${app.color}`}
                          onClick={() => openUpiApp(app)}
                        >
                          <div className="w-10 h-10 mb-1 rounded-full overflow-hidden bg-white flex items-center justify-center">
                            <img 
                              src={app.logo} 
                              alt={app.name} 
                              className="w-8 h-8 object-contain" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <span className="text-xs">{app.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-4 pt-2">
                    <div className="text-sm font-medium text-center">
                      {isUpi ? "Or scan this QR code" : "Scan this QR code"}
                    </div>
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg border">
                      <img src={paymentDetails.qrCode} alt="Payment QR Code" className="w-40 h-40" />
                    </div>
                    
                    {isUpi ? (
                      <div className="grid grid-cols-2 gap-2 w-full">
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
                      </div>
                    ) : (
                      <div className="space-y-2 w-full">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Account Number</div>
                          <div className="flex justify-between">
                            <div className="text-sm">{paymentDetails.accountNumber}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => copyToClipboard(paymentDetails.accountNumber, "Account Number")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">IFSC Code</div>
                          <div className="flex justify-between">
                            <div className="text-sm">{paymentDetails.ifscCode}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => copyToClipboard(paymentDetails.ifscCode, "IFSC Code")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Bank Name</div>
                          <div className="text-sm">{paymentDetails.bankName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Account Holder</div>
                          <div className="text-sm">{paymentDetails.accountHolder}</div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full flex items-center justify-center" 
                      size="sm"
                      onClick={downloadQRCode}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
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
                  {bonusPoints > 0 && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      You'll receive {bonusPoints} bonus Spark Points after verification!
                    </p>
                  )}
                </div>
              </div>
              
              <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900 dark:text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Having issues with your payment? <Link to="/error-report" className="font-medium underline">Report a problem</Link>
                </AlertDescription>
              </Alert>
            </>
          )}
        </ScrollArea>
        
        <DialogFooter>
          {!paymentSubmitted ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !transactionId.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {autoVerifyStatus === 'verifying' ? 'Verifying...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Verify Payment
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
