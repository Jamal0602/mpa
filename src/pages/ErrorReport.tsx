
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle } from "lucide-react";

function ErrorReport() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [errorType, setErrorType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get transaction_id from URL query parameter if available
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const txnId = queryParams.get("transaction_id");
    if (txnId) {
      setTransactionId(txnId);
      setErrorType("transaction");
    }
  }, []);

  // Get user session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setEmail(data.session.user.email);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!errorType) {
      toast.error("Please select the type of error you're reporting.");
      return;
    }
    
    if (!email) {
      toast.error("Please provide your email address so we can contact you.");
      return;
    }
    
    if (!description) {
      toast.error("Please describe the issue you're experiencing.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Using custom fetch instead of direct supabase call since the table might not be in the types
      const apiUrl = `https://yblcuyelcpgqlaxqlwnl.supabase.co/rest/v1/error_reports`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibGN1eWVsY3BncWxheHFsd25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDI3MjcsImV4cCI6MjA1NTk3ODcyN30.wH54y3saOsBNldjg4xTmFsmtW6s7WN1q4CmoBgAb0I0',
          'Authorization': `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          error_type: errorType,
          transaction_id: transactionId || null,
          description,
          contact_email: email,
          status: 'pending'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
        
      setSubmitted(true);
      toast.success("Report Submitted Successfully", {
        description: "We'll review your report and get back to you soon."
      });
      
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Submission Failed", {
        description: "There was an error submitting your report. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-center">Report an Error</h1>
      <p className="text-center mb-8 text-gray-600">
        We're sorry you're experiencing an issue. Please fill out this form to report the problem and we'll look into it as soon as possible.
      </p>
      
      {submitted ? (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center">Report Submitted Successfully</CardTitle>
            <CardDescription className="text-center">
              Thank you for reporting this issue. Our team will review it and get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>Reference Number: <span className="font-medium">{new Date().getTime().toString(36).toUpperCase()}</span></p>
            <p>We've sent a confirmation to your email: <span className="font-medium">{email}</span></p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => navigate("/help")}>
              Return to Help Center
            </Button>
            <Button variant="outline" onClick={() => {
              setSubmitted(false);
              setErrorType("");
              setTransactionId("");
              setDescription("");
            }}>
              Submit Another Report
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Error Report Form</CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us resolve your issue quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="errorType">Error Type</Label>
                <Select 
                  value={errorType} 
                  onValueChange={setErrorType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select error type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">Payment/Transaction Issue</SelectItem>
                    <SelectItem value="technical">Technical Error</SelectItem>
                    <SelectItem value="account">Account Problem</SelectItem>
                    <SelectItem value="service">Service Quality Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {errorType === "transaction" && (
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID (if available)</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your UPI transaction reference"
                  />
                  <p className="text-sm text-muted-foreground">
                    This can be found in your payment app or bank statement
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description of the Issue</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened, when it occurred, and any error messages you saw"
                  rows={5}
                  required
                />
              </div>
              
              {errorType === "transaction" && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Payment Verification Information</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>For payment issues, please include:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          <li>Date and time of payment</li>
                          <li>Payment method used (UPI ID, bank, etc.)</li>
                          <li>Transaction amount</li>
                          <li>Any error message received</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : "Submit Report"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/help")}>
              Back to Help
            </Button>
            {errorType === "transaction" && (
              <Button variant="link" onClick={() => window.open("https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism", "_blank")}>
                Learn about UPI dispute resolution
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default ErrorReport;
