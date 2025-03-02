
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const packages = [
  { name: "Basic", points: 50, price: 499 },
  { name: "Standard", points: 120, price: 999 },
  { name: "Premium", points: 300, price: 1999 },
  { name: "Professional", points: 700, price: 3999 },
];

function Subscription() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(packages[1]);
  const [transactionId, setTransactionId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  const UPI_ID = "ja.jamalasraf@fam";

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUser(data.session.user);
      fetchUserPoints(data.session.user.id);
      fetchTransactions(data.session.user.id);
      setLoading(false);
    };

    checkSession();
  }, [navigate]);

  const fetchUserPoints = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('key_points')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setCurrentPoints(data.key_points || 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchTransactions = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('key_points_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setTransactionHistory(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const verifyPayment = async () => {
    if (!transactionId) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your transaction reference",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);

    try {
      // For demonstration, let's use a simple check
      // In a real application, you would verify with your payment gateway
      const isValid = !transactionId.toLowerCase().includes("fail");
      
      if (isValid) {
        // Add points to user account
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ key_points: currentPoints + selectedPackage.points })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        
        // Record the transaction
        const { data: transactionData, error: transactionError } = await supabase
          .from('key_points_transactions')
          .insert([
            {
              user_id: user.id,
              amount: selectedPackage.points,
              description: `Purchase of ${selectedPackage.name} package`,
              transaction_type: 'purchase'
            }
          ]);
        
        if (transactionError) throw transactionError;
        
        // Update state with new points
        setCurrentPoints(currentPoints + selectedPackage.points);
        
        // Refresh transaction history
        fetchTransactions(user.id);
        
        toast({
          title: "Payment Verified",
          description: `${selectedPackage.points} Spark Points added to your account!`,
        });
        
        // Reset form
        setTransactionId("");
      } else {
        toast({
          title: "Payment Verification Failed",
          description: "Invalid transaction reference. Please check and try again or report the issue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error Processing Payment",
        description: "An error occurred. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Spark Points Subscription</h1>
      <p className="text-center mb-8 text-gray-600">
        Purchase Spark Points to use our services. The more points you buy, the more you save!
      </p>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="purchase">Purchase Points</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchase">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Select a Package</CardTitle>
                    <CardDescription>
                      Choose a Spark Points package that fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.name}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedPackage.name === pkg.name
                              ? "border-primary bg-primary/5"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{pkg.name}</h3>
                              <p className="text-sm text-gray-600">
                                {pkg.points} Spark Points
                              </p>
                            </div>
                            <p className="font-bold">₹{pkg.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Having issues with payments?</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        If you encounter any problems with your payment, please <a href="/report-error?error_type=transaction" className="underline font-medium">report the issue</a> and our team will assist you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Your Purchase</CardTitle>
                    <CardDescription>
                      You currently have {currentPoints} Spark Points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{selectedPackage.name} Package</h3>
                          <p className="text-sm text-gray-600">
                            {selectedPackage.points} Spark Points
                          </p>
                        </div>
                        <p className="font-bold">₹{selectedPackage.price}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border p-4 rounded-lg">
                      <p className="font-medium">Payment Instructions:</p>
                      <ol className="list-decimal ml-5 text-sm space-y-2">
                        <li>Use any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                        <li>
                          Pay <span className="font-medium">₹{selectedPackage.price}</span> to UPI ID:
                          <div className="flex items-center mt-1 bg-blue-50 p-2 rounded">
                            <span className="font-mono font-medium">{UPI_ID}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-6 px-2"
                              onClick={() => {
                                navigator.clipboard.writeText(UPI_ID);
                                toast({
                                  description: "UPI ID copied to clipboard",
                                });
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </li>
                        <li>Enter the transaction reference below</li>
                      </ol>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transaction-id">Transaction Reference</Label>
                      <Input
                        id="transaction-id"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter UPI transaction reference ID"
                      />
                      <p className="text-xs text-gray-500">
                        You can find this in your payment app after completing the transaction
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col space-y-2">
                    <Button
                      onClick={verifyPayment}
                      className="w-full"
                      disabled={verifying}
                    >
                      {verifying ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Verifying...
                        </>
                      ) : (
                        "Verify Payment"
                      )}
                    </Button>
                    <div className="text-xs text-center text-gray-500">
                      By proceeding, you agree to our terms and conditions
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your recent Spark Points transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {transactionHistory.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="py-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className={`font-medium ${
                          transaction.transaction_type === 'purchase' || 
                          transaction.transaction_type === 'earn'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'purchase' || 
                           transaction.transaction_type === 'earn'
                            ? '+' 
                            : '-'}
                          {transaction.amount} SP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <p className="text-sm text-gray-500">
                  Current Balance: <span className="font-bold">{currentPoints} SP</span>
                </p>
                <Button variant="outline" onClick={() => navigate("/help")}>
                  Need Help?
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default Subscription;
