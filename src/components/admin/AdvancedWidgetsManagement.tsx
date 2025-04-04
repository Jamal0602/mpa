
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { 
  Code, Pencil, Trash2, Eye, Plus, Layout, Edit3, 
  ToggleLeft, ArrowUp, ArrowDown, Monitor, Container
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectGroup, SelectItem, 
  SelectLabel, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

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
  location: string;
  active: boolean;
  priority: number;
}

export function AdvancedWidgetsManagement() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "html",
    code: "",
    settings: {},
    location: "homepage",
    active: true,
    priority: 0
  });

  const locationOptions = [
    { value: "homepage", label: "Home Page" },
    { value: "dashboard", label: "Dashboard" },
    { value: "sidebar", label: "Sidebar" },
    { value: "footer", label: "Footer" },
    { value: "header", label: "Header" }
  ];

  const typeOptions = [
    { value: "html", label: "HTML Content" },
    { value: "iframe", label: "External Iframe" },
    { value: "custom", label: "Custom Component" }
  ];

  const { data: widgets, isLoading, refetch } = useQuery({
    queryKey: ["admin-widgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .order("priority", { ascending: true });
        
      if (error) throw error;
      return data as Widget[];
    },
  });

  const handleCreateWidget = () => {
    setFormData({
      title: "",
      description: "",
      type: "html",
      code: "",
      settings: {},
      location: "homepage",
      active: true,
      priority: widgets ? widgets.length + 1 : 1
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
      code: widget.code,
      settings: widget.settings || {},
      location: widget.location || "homepage",
      active: widget.active !== undefined ? widget.active : true,
      priority: widget.priority || 0
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsDeleteDialogOpen(true);
  };

  const handlePreviewWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsPreviewDialogOpen(true);
  };

  const handleToggleActive = async (widget: Widget) => {
    try {
      const { error } = await supabase
        .from("widgets")
        .update({
          active: !widget.active,
          updated_at: new Date().toISOString()
        })
        .eq("id", widget.id);
        
      if (error) throw error;
      toast.success(`Widget ${widget.active ? 'deactivated' : 'activated'} successfully!`);
      refetch();
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    }
  };

  const handleMovePriority = async (widget: Widget, direction: 'up' | 'down') => {
    if (!widgets) return;
    
    const locationWidgets = widgets.filter(w => w.location === widget.location);
    const currentIndex = locationWidgets.findIndex(w => w.id === widget.id);
    
    if (direction === 'up' && currentIndex <= 0) return;
    if (direction === 'down' && currentIndex >= locationWidgets.length - 1) return;
    
    try {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetWidget = locationWidgets[targetIndex];
      
      const batch = [];
      
      batch.push(
        supabase
          .from("widgets")
          .update({ priority: targetWidget.priority })
          .eq("id", widget.id)
      );
      
      batch.push(
        supabase
          .from("widgets")
          .update({ priority: widget.priority })
          .eq("id", targetWidget.id)
      );
      
      await Promise.all(batch);
      
      toast.success("Widget order updated");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to update order: ${error.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'type' && value === 'iframe' && formData.settings) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        settings: { ...prev.settings, url: '', height: '400px' }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!user) return;

      // Validation
      if (!formData.title.trim()) {
        toast.error("Title is required");
        return;
      }

      if (formData.type === 'html' && !formData.code.trim()) {
        toast.error("Widget code is required");
        return;
      }

      if (formData.type === 'iframe' && !formData.settings.url) {
        toast.error("URL is required for iframes");
        return;
      }

      const widgetData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        code: formData.code,
        settings: formData.settings,
        location: formData.location,
        active: formData.active,
        priority: formData.priority,
        updated_at: new Date().toISOString()
      };

      if (selectedWidget) {
        // Update existing widget
        const { error } = await supabase
          .from("widgets")
          .update(widgetData)
          .eq("id", selectedWidget.id);
          
        if (error) throw error;
        toast.success("Widget updated successfully!");
      } else {
        // Create new widget
        const { error } = await supabase
          .from("widgets")
          .insert({
            ...widgetData,
            created_by: user.id
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

  const getFilteredWidgets = () => {
    if (!widgets) return [];
    
    switch (activeTab) {
      case "active":
        return widgets.filter((widget) => widget.active);
      case "inactive":
        return widgets.filter((widget) => !widget.active);
      case locationOptions[0].value:
      case locationOptions[1].value:
      case locationOptions[2].value:
      case locationOptions[3].value:
      case locationOptions[4].value:
        return widgets.filter((widget) => widget.location === activeTab);
      default:
        return widgets;
    }
  };

  const filteredWidgets = getFilteredWidgets();

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Widgets Management</h2>
        <Button onClick={handleCreateWidget} className="gap-2">
          <Plus className="h-4 w-4" /> New Widget
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="all">All Widgets</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap gap-2 mb-4">
          {locationOptions.map((location) => (
            <Badge 
              key={location.value}
              variant={activeTab === location.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveTab(location.value)}
            >
              {location.label}
            </Badge>
          ))}
        </div>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWidgets.length > 0 ? (
              filteredWidgets.map((widget) => (
                <Card key={widget.id} className={`overflow-hidden ${!widget.active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {widget.title}
                          {widget.type === 'html' && <Code className="h-4 w-4 text-blue-500" />}
                          {widget.type === 'iframe' && <Monitor className="h-4 w-4 text-green-500" />}
                          {widget.type === 'custom' && <Container className="h-4 w-4 text-purple-500" />}
                        </CardTitle>
                        <CardDescription>
                          {widget.location && locationOptions.find(l => l.value === widget.location)?.label}
                          {widget.priority !== undefined && ` • Priority: ${widget.priority}`}
                        </CardDescription>
                      </div>
                      <Badge variant={widget.active ? "default" : "secondary"}>
                        {widget.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground line-clamp-2">
                      {widget.description || "No description provided"}
                    </p>
                    
                    {widget.type === 'iframe' && widget.settings?.url && (
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        URL: {widget.settings.url}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-between pt-0 gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewWidget(widget)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleMovePriority(widget, 'up')}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleMovePriority(widget, 'down')}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={widget.active ? "ghost" : "outline"} 
                        size="sm" 
                        onClick={() => handleToggleActive(widget)}
                      >
                        <ToggleLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditWidget(widget)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirmation(widget)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p>No widgets found. {activeTab === "all" ? "Create your first widget!" : `No ${activeTab} widgets available.`}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Widget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedWidget ? "Edit Widget" : "Create New Widget"}</DialogTitle>
            <DialogDescription>
              {selectedWidget ? "Make changes to your widget here." : "Create a new widget for your site."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 px-1">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Short description for this widget..."
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Widget Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => handleSelectChange("location", value)}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Page Locations</SelectLabel>
                        {locationOptions.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  min="0"
                  placeholder="Display order priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>
              
              {formData.type === 'iframe' && (
                <div className="space-y-4 border rounded-md p-4">
                  <h4 className="font-medium">Iframe Settings</h4>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      name="url"
                      placeholder="https://example.com/embed"
                      value={formData.settings.url || ''}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      name="height"
                      placeholder="400px"
                      value={formData.settings.height || '400px'}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>
              )}
              
              {formData.type === 'html' && (
                <div className="grid gap-2">
                  <Label htmlFor="code">HTML Content</Label>
                  <Textarea
                    id="code"
                    name="code"
                    placeholder="<div>Your HTML content here</div>"
                    className="font-mono min-h-[200px] text-sm"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </ScrollArea>
          
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Widget Preview: {selectedWidget?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-lg p-4 bg-background">
            {selectedWidget && (
              <div className="widget-preview">
                {selectedWidget.type === 'html' && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedWidget.code }} 
                    className="widget-html-container"
                  />
                )}
                
                {selectedWidget.type === 'iframe' && selectedWidget.settings?.url && (
                  <iframe 
                    src={selectedWidget.settings.url} 
                    className="w-full border-0"
                    style={{ height: selectedWidget.settings?.height || '400px' }}
                    title={selectedWidget.title}
                  />
                )}
                
                {selectedWidget.type === 'custom' && (
                  <div className="p-4 text-center text-muted-foreground">
                    Custom widget preview not available
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
