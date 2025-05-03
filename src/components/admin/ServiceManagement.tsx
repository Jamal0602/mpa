
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

interface ServiceOffer {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
  discount_percentage: number | null;
  is_active: boolean | null;
  start_date: string | null;
  end_date: string | null;
  per_page_pricing: boolean | null;
  created_at: string;
}

export function ServiceManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffer | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    point_cost: 0,
    discount_percentage: 0,
    is_active: true,
    per_page_pricing: false,
  });

  // Query to fetch all services
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("MPA_service_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ServiceOffer[];
    },
  });

  // Mutation to create a new service
  const createServiceMutation = useMutation({
    mutationFn: async (newService: Omit<ServiceOffer, "id" | "created_at" | "start_date" | "end_date">) => {
      const { data, error } = await supabase
        .from("MPA_service_offers")
        .insert([newService])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error creating service: ${error.message}`);
    },
  });

  // Mutation to update an existing service
  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      service,
    }: {
      id: string;
      service: Partial<ServiceOffer>;
    }) => {
      const { data, error } = await supabase
        .from("MPA_service_offers")
        .update(service)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service updated successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error updating service: ${error.message}`);
    },
  });

  // Mutation to delete a service
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("MPA_service_offers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting service: ${error.message}`);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setServiceForm({
      ...serviceForm,
      [name]: name === "point_cost" || name === "discount_percentage" ? Number(value) : value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setServiceForm({
      ...serviceForm,
      [name]: checked,
    });
  };

  const handleEditService = (service: ServiceOffer) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || "",
      point_cost: service.point_cost,
      discount_percentage: service.discount_percentage || 0,
      is_active: service.is_active || false,
      per_page_pricing: service.per_page_pricing || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.name || serviceForm.point_cost <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService.id,
        service: serviceForm,
      });
    } else {
      createServiceMutation.mutate(serviceForm as any);
    }
  };

  const resetForm = () => {
    setServiceForm({
      name: "",
      description: "",
      point_cost: 0,
      discount_percentage: 0,
      is_active: true,
      per_page_pricing: false,
    });
    setEditingService(null);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? "Update service details below"
                  : "Create a new service offering"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={serviceForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={serviceForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="point_cost">Point Cost *</Label>
                <Input
                  id="point_cost"
                  name="point_cost"
                  type="number"
                  value={serviceForm.point_cost}
                  onChange={handleInputChange}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Discount Percentage</Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  type="number"
                  value={serviceForm.discount_percentage}
                  onChange={handleInputChange}
                  min={0}
                  max={100}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={serviceForm.is_active}
                  onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="per_page_pricing"
                  checked={serviceForm.per_page_pricing}
                  onCheckedChange={(checked) => handleSwitchChange("per_page_pricing", checked)}
                />
                <Label htmlFor="per_page_pricing">Price per page</Label>
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
                <Button type="submit">
                  {editingService ? "Update" : "Create"} Service
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Services</CardTitle>
          <CardDescription>
            Manage and customize service offerings for your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Point Cost</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services && services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      {service.description ? (
                        service.description.length > 50 ? (
                          `${service.description.substring(0, 50)}...`
                        ) : (
                          service.description
                        )
                      ) : (
                        <span className="text-muted-foreground">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.point_cost}
                      {service.per_page_pricing && <span className="text-xs ml-1">/page</span>}
                    </TableCell>
                    <TableCell>
                      {service.discount_percentage
                        ? `${service.discount_percentage}%`
                        : "0%"}
                    </TableCell>
                    <TableCell>
                      {service.is_active ? (
                        <span className="flex items-center">
                          <CheckCircle className="mr-1 h-4 w-4 text-green-500" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <XCircle className="mr-1 h-4 w-4 text-red-500" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No services found. Click "Add Service" to create one.
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
