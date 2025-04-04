
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertCircle, CheckCircle, Clock, Filter, MoreHorizontal, 
  Trash2, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ErrorReport {
  id: string;
  error_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  contact_email: string;
  user_id: string;
  error_message: string;
  error_details: any;
  page_url: string;
  browser_info: string;
  steps_to_reproduce: string;
  priority: string;
  category: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  user?: {
    username: string;
  };
}

export function ErrorReportManagement() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ["error-reports", filterStatus],
    queryFn: async () => {
      let query = supabase
        .from("error_reports")
        .select(`
          *,
          user:user_id (username)
        `)
        .order("created_at", { ascending: false });
        
      if (filterStatus) {
        query = query.eq("status", filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as (ErrorReport & { user: { username: string } })[];
    },
  });

  const handleViewReport = (report: ErrorReport) => {
    setSelectedReport(report);
    setResolutionNotes(report.resolution_notes || "");
    setSelectedStatus(report.status);
    setIsViewDialogOpen(true);
  };

  const handleDeleteReport = (report: ErrorReport) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from("error_reports")
        .delete()
        .eq("id", selectedReport.id);
        
      if (error) throw error;
      
      toast.success("Error report deleted successfully");
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !user) return;

    try {
      const updates: any = {
        status: selectedStatus,
      };

      if (selectedStatus === "resolved") {
        updates.resolution_notes = resolutionNotes;
        updates.resolved_by = user.id;
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("error_reports")
        .update(updates)
        .eq("id", selectedReport.id);
        
      if (error) throw error;
      
      toast.success(`Report status updated to ${selectedStatus}`);
      refetch();
      setIsViewDialogOpen(false);
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = (status: string) => {
    if (!reports) return [];
    return reports.filter(report => report.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Error Reports Management</h2>
        <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value === "" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{filterStatus ? `Filter: ${filterStatus}` : "All Reports"}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2 bg-yellow-500">{filteredReports("pending").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress <Badge className="ml-2 bg-blue-500">{filteredReports("in_progress").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved <Badge className="ml-2 bg-green-500">{filteredReports("resolved").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected <Badge className="ml-2 bg-red-500">{filteredReports("rejected").length}</Badge>
          </TabsTrigger>
        </TabsList>

        {["pending", "in_progress", "resolved", "rejected"].map(status => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredReports(status).length > 0 ? (
                  filteredReports(status).map((report) => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="line-clamp-1">{report.title}</CardTitle>
                            <CardDescription>
                              Reported: {new Date(report.created_at).toLocaleDateString()}
                              {report.user && ` by ${report.user.username}`}
                            </CardDescription>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Type:</p>
                            <p className="text-sm text-muted-foreground">{report.error_type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Description:</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>View Details</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteReport(report)}>
                              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                              <span className="text-destructive">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    No {status.replace('_', ' ')} reports found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              Reported on {selectedReport && new Date(selectedReport.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium">Status:</p>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="font-medium">Type:</p>
                <p className="text-muted-foreground">{selectedReport?.error_type}</p>
              </div>
              
              <div>
                <p className="font-medium">Priority:</p>
                <p className="text-muted-foreground">{selectedReport?.priority || "Not specified"}</p>
              </div>
              
              <div>
                <p className="font-medium">Category:</p>
                <p className="text-muted-foreground">{selectedReport?.category || "Not specified"}</p>
              </div>
              
              <div>
                <p className="font-medium">Contact Email:</p>
                <p className="text-muted-foreground">{selectedReport?.contact_email}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium">Description:</p>
                <p className="text-muted-foreground">{selectedReport?.description}</p>
              </div>
              
              <div>
                <p className="font-medium">Error Message:</p>
                <p className="text-muted-foreground line-clamp-3">{selectedReport?.error_message}</p>
              </div>
              
              <div>
                <p className="font-medium">Page URL:</p>
                <p className="text-muted-foreground break-all">{selectedReport?.page_url}</p>
              </div>
              
              <div>
                <p className="font-medium">Browser Info:</p>
                <p className="text-muted-foreground">{selectedReport?.browser_info}</p>
              </div>
            </div>
          </div>
          
          {(selectedStatus === "resolved" || selectedStatus === "rejected") && (
            <div>
              <p className="font-medium">Resolution Notes:</p>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add notes about how this issue was resolved or why it was rejected..."
                className="mt-2"
                rows={4}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this error report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
