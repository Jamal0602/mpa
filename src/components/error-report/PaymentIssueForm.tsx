
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface PaymentIssueFormProps {
  onSuccess?: () => void;
}

export function PaymentIssueForm({ onSuccess }: PaymentIssueFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to report issues");
      navigate("/login");
      return;
    }
    
    if (!transactionId.trim() || !description.trim() || !contactEmail.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: reportError } = await supabase
        .from('error_reports')
        .insert({
          user_id: user.id,
          error_type: 'payment',
          transaction_id: transactionId.trim(),
          description: description.trim(),
          contact_email: contactEmail.trim(),
          title: `Payment Issue: ${transactionId.trim()}`,
          status: 'pending'
        });
        
      if (reportError) throw reportError;
      
      toast.success("Payment issue reported successfully!");
      
      // Reset form
      setTransactionId('');
      setDescription('');
      setContactEmail('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
      toast.error("Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Report Payment Issue</CardTitle>
        <CardDescription>
          Let us know about any problems with your payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction Reference ID</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter the transaction or reference ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description of Issue</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue you're experiencing in detail"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Your email for correspondence"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        Our team will review your report and respond within 24-48 hours
      </CardFooter>
    </Card>
  );
}
