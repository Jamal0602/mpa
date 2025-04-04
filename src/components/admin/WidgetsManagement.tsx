
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, Code, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";

interface Widget {
  id: string;
  title: string;
  description: string;
  type: string;
  code: string;
  settings: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const widgetTypes = [
  { value: "analytics", label: "Analytics" },
  { value: "chart", label: "Chart" },
  { value: "data", label: "Data Display" },
  { value: "form", label: "Form" },
  { value: "user", label: "User Interface" },
  { value: "custom", label: "Custom" },
];

export function WidgetsManagement() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "custom",
    code: "",
  });

  const { data: widgets, isLoading, refetch } = useQuery({
    queryKey: ["admin-widgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Widget[];
    },
  });

  const handleCreateWidget = () => {
    setFormData({
      title: "",
      description: "",
      type: "custom",
      code: "",
    });
    setSelectedWidget(null);
    setIsDialogOpen(true);
  };

  const handleEditWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setFormData({
      title: widget.title,
      description: widget.description,
      type: widget.type,
      code: widget.code || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user) return;

      if (selectedWidget) {
        // Update existing widget
        const { error } = await supabase
          .from("widgets")
          .update({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            code: formData.code,
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedWidget.id);
          
        if (error) throw error;
        toast.success("Widget updated successfully!");
      } else {
        // Create new widget
        const { error } = await supabase
          .from("widgets")
          .insert({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            code: formData.code,
            created_by: user.id,
            settings: {}
          });
          
        if (error) throw error;
        toast.success("Widget created successfully!");
      }
      
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedWidget) return;
      
      const { error } = await supabase
        .from("widgets")
        .delete()
        .eq("id", selectedWidget.id);
        
      if (error) throw error;
      toast.success("Widget deleted successfully!");
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const getWidgetTypeLabel = (type: string) => {
    const widget = widgetTypes.find(w => w.value === type);
    return widget ? widget.label : "Custom";
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Widgets Management</h2>
        <Button onClick={handleCreateWidget} className="gap-2">
          <Plus className="h-4 w-4" /> New Widget
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets && widgets.length > 0 ? (
          widgets.map((widget) => (
            <Card key={widget.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{widget.title}</CardTitle>
                  <Badge variant="outline">{getWidgetTypeLabel(widget.type)}</Badge>
                </div>
                <CardDescription>
                  {new Date(widget.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {widget.description}
                </p>
                {widget.code && (
                  <div className="mt-2 p-2 bg-muted rounded-md overflow-hidden">
                    <code className="text-xs line-clamp-2">{widget.code}</code>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditWidget(widget)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirmation(widget)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p>No widgets found. Create your first widget!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Widget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedWidget ? "Edit Widget" : "Create New Widget"}</DialogTitle>
            <DialogDescription>
              {selectedWidget ? "Make changes to your widget here." : "Create a new widget for your application."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Widget title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Widget Type</Label>
              <Select value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what this widget does"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Widget Code</Label>
              <Textarea
                id="code"
                name="code"
                placeholder="Add custom code for this widget (optional)"
                className="font-mono text-xs min-h-[150px]"
                value={formData.code}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {selectedWidget ? "Save Changes" : "Create Widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this widget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
