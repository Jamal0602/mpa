
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomBadge } from "@/components/ui/custom-badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Eye
} from "lucide-react";

interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  spark_points: number;
  payment_method: string;
  payment_reference: string | null;
  status: string;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

type VerificationAction = "verify" | "reject";

export function PaymentVerification() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [verificationAction, setVerificationAction] = useState<VerificationAction | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [paymentsPerPage] = useState(10);

  // Query to fetch payment transactions
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payment-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select(`
          *,
          user:user_id (
            full_name,
            email:custom_email,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PaymentTransaction[];
    },
  });

  // Mutation to verify/reject payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ 
      paymentId, 
      action, 
      note 
    }: { 
      paymentId: string; 
      action: VerificationAction; 
      note?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;

      if (!adminId) {
        throw new Error("You must be logged in to verify payments");
      }

      const { data, error } = await supabase
        .from("payment_transactions")
        .update({
          verification_status: action === "verify" ? "verified" : "rejected",
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          status: action === "verify" ? "completed" : "failed"
        })
        .eq("id", paymentId)
        .select();
      
      if (error) throw error;
      
      // If rejected, create a notification for user
      if (action === "reject" && selectedPayment) {
        await supabase
          .from("notifications")
          .insert({
            user_id: selectedPayment.user_id,
            title: "Payment Verification Failed",
            message: note || "Your payment verification was rejected. Please contact support for assistance.",
            type: "error"
          });
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-transactions"] });
      toast.success(verificationAction === "verify" 
        ? "Payment successfully verified" 
        : "Payment rejected");
      setVerificationAction(null);
      setSelectedPayment(null);
      setVerificationNote("");
      setIsVerifyDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Filter payments based on search and status
  const filteredPayments = (paymentsData || []).filter(payment => {
    const matchesSearch = 
      payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "all" || 
      payment.verification_status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });
  
  // Pagination
  const indexOfLastPayment = page * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  
  const handleVerifyPayment = (payment: PaymentTransaction, action: VerificationAction) => {
    setSelectedPayment(payment);
    setVerificationAction(action);
    setIsVerifyDialogOpen(true);
  };
  
  const viewPaymentDetails = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };
  
  const confirmVerification = async () => {
    if (!selectedPayment || !verificationAction) return;
    
    await verifyPaymentMutation.mutateAsync({
      paymentId: selectedPayment.id,
      action: verificationAction,
      note: verificationNote
    });
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoadingPayments) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification</CardTitle>
          <CardDescription>
            Verify payment transactions and approve spark points
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Spark Points</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPayments.length > 0 ? (
                    currentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.user?.full_name || "Unknown User"}
                        </TableCell>
                        <TableCell>
                          {payment.amount} {payment.currency}
                        </TableCell>
                        <TableCell>{payment.spark_points}</TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {payment.payment_reference ? (
                            <div 
                              onClick={() => copyToClipboard(payment.payment_reference || "")}
                              className="text-xs bg-secondary px-2 py-1 rounded-full cursor-pointer hover:bg-secondary/80 transition-colors"
                              title="Click to copy"
                            >
                              {payment.payment_reference.substring(0, 8)}...
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No reference</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.verification_status === "unverified" && (
                            <CustomBadge variant="warning" className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" /> Pending
                            </CustomBadge>
                          )}
                          {payment.verification_status === "verified" && (
                            <CustomBadge variant="success" className="flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3" /> Verified
                            </CustomBadge>
                          )}
                          {payment.verification_status === "rejected" && (
                            <CustomBadge variant="destructive" className="flex items-center">
                              <XCircle className="mr-1 h-3 w-3" /> Rejected
                            </CustomBadge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewPaymentDetails(payment)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            {payment.verification_status === "unverified" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleVerifyPayment(payment, "verify")}
                                  title="Approve payment"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Verify</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleVerifyPayment(payment, "reject")}
                                  title="Reject payment"
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="sr-only">Reject</span>
                                </Button>
                              </>
                            )}
                            {payment.payment_reference && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openExternalLink(`https://example.com/verify/${payment.payment_reference}`)}
                                title="Check externally"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">External</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No payments found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
          
          {/* Pagination */}
          {filteredPayments.length > paymentsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} payments
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={indexOfLastPayment >= filteredPayments.length}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === "verify" ? "Verify Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {verificationAction === "verify"
                ? "Confirm verification of this payment. This will credit the user with Spark Points."
                : "Reject this payment. The user will not receive Spark Points."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">User</div>
                <div>{selectedPayment?.user?.full_name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Amount</div>
                <div>{selectedPayment?.amount} {selectedPayment?.currency}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Spark Points</div>
                <div>{selectedPayment?.spark_points}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Reference</div>
                <div className="break-all">{selectedPayment?.payment_reference || "No reference"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Date</div>
                <div>{new Date(selectedPayment?.created_at || "").toLocaleString()}</div>
              </div>
              
              {verificationAction === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="note">Rejection Reason</Label>
                  <Textarea
                    id="note"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Add a reason for rejecting this payment"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmVerification}
              variant={verificationAction === "verify" ? "default" : "destructive"}
            >
              {verificationAction === "verify" ? "Verify Payment" : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Payment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete payment transaction information
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Transaction ID</div>
                <div className="text-sm break-all">{selectedPayment?.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">User</div>
                <div className="text-sm">{selectedPayment?.user?.full_name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm">{selectedPayment?.user?.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Amount</div>
                <div className="text-sm">{selectedPayment?.amount} {selectedPayment?.currency}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Spark Points</div>
                <div className="text-sm">{selectedPayment?.spark_points}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Payment Method</div>
                <div className="text-sm capitalize">{selectedPayment?.payment_method.replace('_', ' ')}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Reference</div>
                <div className="text-sm break-all">
                  <div className="flex items-center gap-2">
                    <span>{selectedPayment?.payment_reference || "No reference"}</span>
                    {selectedPayment?.payment_reference && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(selectedPayment.payment_reference || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Status</div>
                <div className="text-sm">
                  {selectedPayment?.verification_status === "unverified" && (
                    <span className="text-amber-500 font-medium">Pending Verification</span>
                  )}
                  {selectedPayment?.verification_status === "verified" && (
                    <span className="text-green-500 font-medium">Verified</span>
                  )}
                  {selectedPayment?.verification_status === "rejected" && (
                    <span className="text-red-500 font-medium">Rejected</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Date Created</div>
                <div className="text-sm">{new Date(selectedPayment?.created_at || "").toLocaleString()}</div>
              </div>
              {selectedPayment?.verified_at && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Verified At</div>
                    <div className="text-sm">{new Date(selectedPayment.verified_at).toLocaleString()}</div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="flex gap-2">
            {selectedPayment?.payment_reference && (
              <Button 
                variant="outline" 
                onClick={() => openExternalLink(`https://example.com/verify/${selectedPayment.payment_reference}`)}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Verify Externally
              </Button>
            )}
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}
