
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomBadge } from "@/components/ui/custom-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Clock,
  UserPlus2,
} from "lucide-react";

interface RoleRequest {
  id: string;
  requester_id: string;
  target_user_id: string;
  requested_role: string;
  status: string;
  reason: string | null;
  approver_id: string | null;
  approved_at: string | null;
  created_at: string;
  requester?: {
    full_name: string;
    username: string;
    email: string;
    avatar_url: string | null;
  };
  target_user?: {
    full_name: string;
    username: string;
    email: string;
    avatar_url: string | null;
  };
}

export function RoleRequests() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requestForm, setRequestForm] = useState({
    target_email: "",
    requested_role: "employee",
    reason: "",
  });

  // Query to fetch all role requests
  const { data: roleRequests, isLoading } = useQuery({
    queryKey: ["role-requests"],
    queryFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      const userId = currentUser.user?.id;

      const isAdmin = await supabase
        .rpc('is_admin', { user_id: userId })
        .single();

      // If admin, fetch all requests, otherwise fetch only user's requests
      const query = isAdmin.data
        ? supabase
            .from("role_requests")
            .select(`
              *,
              requester:requester_id(
                full_name,
                username,
                email:custom_email,
                avatar_url
              ),
              target_user:target_user_id(
                full_name,
                username,
                email:custom_email,
                avatar_url
              )
            `)
        : supabase
            .from("role_requests")
            .select(`
              *,
              requester:requester_id(
                full_name,
                username,
                email:custom_email,
                avatar_url
              ),
              target_user:target_user_id(
                full_name,
                username,
                email:custom_email,
                avatar_url
              )
            `)
            .or(`requester_id.eq.${userId},target_user_id.eq.${userId}`);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as RoleRequest[];
    },
  });

  // Mutation to create a new role request
  const createRequestMutation = useMutation({
    mutationFn: async (formData: typeof requestForm) => {
      // First, find the user ID by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("custom_email", formData.target_email)
        .single();

      if (userError || !userData) {
        throw new Error("User not found with that email");
      }

      const { data: currentUser } = await supabase.auth.getUser();
      const requesterId = currentUser.user?.id;

      if (!requesterId) {
        throw new Error("You must be logged in to make a request");
      }

      const { data, error } = await supabase
        .from("role_requests")
        .insert([
          {
            requester_id: requesterId,
            target_user_id: userData.id,
            requested_role: formData.requested_role,
            reason: formData.reason,
            status: "pending",
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-requests"] });
      toast.success("Role request submitted successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error creating request: ${error.message}`);
    },
  });

  // Mutation to update a role request status
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => {
      const { data: currentUser } = await supabase.auth.getUser();
      const approverId = currentUser.user?.id;

      if (!approverId) {
        throw new Error("You must be logged in to approve requests");
      }

      const { data, error } = await supabase
        .from("role_requests")
        .update({
          status,
          approver_id: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) throw error;

      // If approved, update the user's role
      if (status === "approved") {
        const request = data[0] as RoleRequest;
        const { error: roleError } = await supabase
          .from("profiles")
          .update({ role: request.requested_role })
          .eq("id", request.target_user_id);

        if (roleError) throw roleError;
      }

      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["role-requests"] });
      toast.success(
        `Request ${data.status === "approved" ? "approved" : "rejected"} successfully`
      );
    },
    onError: (error) => {
      toast.error(`Error updating request status: ${error.message}`);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value,
    });
  };

  const handleRoleChange = (value: string) => {
    setRequestForm({
      ...requestForm,
      requested_role: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.target_email || !requestForm.requested_role) {
      toast.error("Please fill in all required fields");
      return;
    }
    createRequestMutation.mutate(requestForm);
  };

  const resetForm = () => {
    setRequestForm({
      target_email: "",
      requested_role: "employee",
      reason: "",
    });
  };

  // Filter requests based on search and status
  const filteredRequests = (roleRequests || []).filter((request) => {
    const matchesSearch =
      request.requester?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.target_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.target_user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Role Requests</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus2 className="mr-2 h-4 w-4" /> New Role Request
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Role Request</DialogTitle>
              <DialogDescription>
                Request a role change for a user or yourself
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target_email">Target User Email *</Label>
                <Input
                  id="target_email"
                  name="target_email"
                  value={requestForm.target_email}
                  onChange={handleInputChange}
                  placeholder="Enter target user email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requested_role">Requested Role *</Label>
                <Select
                  value={requestForm.requested_role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={requestForm.reason}
                  onChange={handleInputChange}
                  placeholder="Why should this role be granted?"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Change Requests</CardTitle>
          <CardDescription>
            Manage role change requests and approvals
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Target User</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.requester?.full_name || "Unknown User"}
                    </TableCell>
                    <TableCell>
                      {request.target_user?.full_name || "Unknown User"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {request.requested_role}
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <CustomBadge variant="warning" className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" /> Pending
                        </CustomBadge>
                      )}
                      {request.status === "approved" && (
                        <CustomBadge variant="success" className="flex items-center">
                          <CheckCircle className="mr-1 h-3 w-3" /> Approved
                        </CustomBadge>
                      )}
                      {request.status === "rejected" && (
                        <CustomBadge variant="destructive" className="flex items-center">
                          <XCircle className="mr-1 h-3 w-3" /> Rejected
                        </CustomBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600"
                              onClick={() =>
                                updateRequestStatusMutation.mutate({
                                  id: request.id,
                                  status: "approved",
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600"
                              onClick={() =>
                                updateRequestStatusMutation.mutate({
                                  id: request.id,
                                  status: "rejected",
                                })
                              }
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No role requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
