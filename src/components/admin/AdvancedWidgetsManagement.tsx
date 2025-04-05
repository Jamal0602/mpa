import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash, Save, Code, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Widget {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
  content: string;
  metadata: {
    url?: string;
    height?: number;
    // other metadata
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  active: boolean;
}

const AdvancedWidgetsManagement = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [newWidget, setNewWidget] = useState<Partial<Widget>>({
    name: "",
    description: "",
    location: "homepage",
    type: "html",
    content: "",
    active: true,
    metadata: {}
  });
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure metadata is properly parsed and contains url and height properties
      const processedWidgets = data.map(widget => ({
        ...widget,
        metadata: widget.metadata || {}
      }));
      
      setWidgets(processedWidgets);
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast.error("Failed to load widgets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWidgetChange = (field: string, value: any) => {
    if (editingWidget) {
      // If editing an existing widget
      if (field.startsWith('metadata.')) {
        const metadataField = field.split('.')[1];
        setEditingWidget({
          ...editingWidget,
          metadata: {
            ...editingWidget.metadata,
            [metadataField]: value
          }
        });
      } else {
        setEditingWidget({
          ...editingWidget,
          [field]: value
        });
      }
    } else {
      // If creating a new widget
      if (field.startsWith('metadata.')) {
        const metadataField = field.split('.')[1];
        setNewWidget({
          ...newWidget,
          metadata: {
            ...newWidget.metadata,
            [metadataField]: value
          }
        });
      } else {
        setNewWidget({
          ...newWidget,
          [field]: value
        });
      }
    }
  };

  const handleSaveWidget = async () => {
    try {
      if (editingWidget) {
        // Update existing widget
        const { error } = await supabase
          .from('widgets')
          .update({
            name: editingWidget.name,
            description: editingWidget.description,
            location: editingWidget.location,
            type: editingWidget.type,
            content: editingWidget.content,
            metadata: editingWidget.metadata || {},
            active: editingWidget.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingWidget.id);

        if (error) throw error;
        
        toast.success("Widget updated successfully");
        setEditingWidget(null);
      } else {
        // Create new widget
        const { error } = await supabase
          .from('widgets')
          .insert({
            name: newWidget.name,
            description: newWidget.description,
            location: newWidget.location,
            type: newWidget.type,
            content: newWidget.content,
            metadata: newWidget.metadata || {},
            active: newWidget.active
          });

        if (error) throw error;
        
        toast.success("Widget created successfully");
        setNewWidget({
          name: "",
          description: "",
          location: "homepage",
          type: "html",
          content: "",
          active: true,
          metadata: {}
        });
      }
      fetchWidgets();
    } catch (error) {
      console.error('Error saving widget:', error);
      toast.error("Failed to save widget");
    }
  };

  const handleDeleteWidget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this widget?")) return;
    
    try {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Widget deleted successfully");
      fetchWidgets();
      if (editingWidget?.id === id) {
        setEditingWidget(null);
      }
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error("Failed to delete widget");
    }
  };

  const handleEditWidget = (widget: Widget) => {
    // Ensure metadata has url and height properties to avoid the TS errors
    const updatedWidget = {
      ...widget,
      metadata: {
        url: '',
        height: 300,
        ...widget.metadata
      }
    };
    setEditingWidget(updatedWidget);
    setPreviewMode(false);
  };

  // Filter widgets based on active tab
  const filteredWidgets = widgets.filter(widget => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return widget.active;
    if (activeTab === "inactive") return !widget.active;
    if (activeTab === "homepage") return widget.location === "homepage";
    if (activeTab === "dashboard") return widget.location === "dashboard";
    return true;
  });

  // Render preview of widget content based on type
  const renderPreview = (widget: Widget) => {
    const widgetToPreview = editingWidget || widget;
    
    if (widgetToPreview.type === "html") {
      return (
        <div 
          className="border p-4 rounded bg-card"
          dangerouslySetInnerHTML={{ __html: widgetToPreview.content || '' }}
        />
      );
    } else if (widgetToPreview.type === "iframe") {
      return (
        <iframe
          src={widgetToPreview.metadata?.url || ''}
          height={widgetToPreview.metadata?.height || 300}
          className="w-full border rounded"
          title={widgetToPreview.name}
        />
      );
    } else {
      return (
        <div className="border p-4 rounded bg-card">
          <p className="text-muted-foreground">Preview not available for this widget type.</p>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Widget Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Widgets</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <div className="space-y-4">
                {filteredWidgets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No widgets found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredWidgets.map(widget => (
                      <Card key={widget.id} className={`overflow-hidden transition-colors ${!widget.active ? 'border-dashed opacity-70' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{widget.name}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">{widget.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditWidget(widget)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteWidget(widget.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${widget.active ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                              {widget.active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">
                              {widget.location}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-500">
                              {widget.type}
                            </span>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => {
                      setEditingWidget(null);
                      setNewWidget({
                        name: "",
                        description: "",
                        location: "homepage",
                        type: "html",
                        content: "",
                        active: true,
                        metadata: {
                          url: '',
                          height: 300
                        }
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Widget
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Widget Editor */}
      {(editingWidget || newWidget.name !== "") && (
        <Card>
          <CardHeader>
            <CardTitle>{editingWidget ? 'Edit Widget' : 'Create Widget'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingWidget ? editingWidget.name : newWidget.name}
                    onChange={(e) => handleWidgetChange('name', e.target.value)}
                    placeholder="Widget name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={editingWidget ? editingWidget.location : newWidget.location}
                    onValueChange={(value) => handleWidgetChange('location', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingWidget ? editingWidget.description : newWidget.description}
                  onChange={(e) => handleWidgetChange('description', e.target.value)}
                  placeholder="Widget description"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Widget Type</Label>
                  <Select
                    value={editingWidget ? editingWidget.type : newWidget.type}
                    onValueChange={(value) => handleWidgetChange('type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="iframe">iFrame</SelectItem>
                      <SelectItem value="component">React Component</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="active">Status</Label>
                  <Select
                    value={(editingWidget ? editingWidget.active : newWidget.active) ? "active" : "inactive"}
                    onValueChange={(value) => handleWidgetChange('active', value === "active")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Conditional fields based on widget type */}
              {(editingWidget?.type === "iframe" || (!editingWidget && newWidget.type === "iframe")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iframe-url">iFrame URL</Label>
                    <Input
                      id="iframe-url"
                      value={editingWidget ? editingWidget.metadata?.url || '' : newWidget.metadata?.url || ''}
                      onChange={(e) => handleWidgetChange('metadata.url', e.target.value)}
                      placeholder="https://example.com/embed"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="iframe-height">iFrame Height (px)</Label>
                    <Input
                      id="iframe-height"
                      type="number"
                      value={editingWidget ? editingWidget.metadata?.height || 300 : newWidget.metadata?.height || 300}
                      onChange={(e) => handleWidgetChange('metadata.height', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
              
              {/* Content field for HTML or component types */}
              {((editingWidget?.type === "html" || editingWidget?.type === "component") || 
                (!editingWidget && (newWidget.type === "html" || newWidget.type === "component"))) && (
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="content">Content</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? (
                          <>
                            <Code className="mr-1 h-4 w-4" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-4 w-4" />
                            Preview
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {previewMode ? (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      {renderPreview(editingWidget || { ...newWidget, id: '', created_at: '', updated_at: '' } as Widget)}
                    </div>
                  ) : (
                    <Textarea
                      id="content"
                      value={editingWidget ? editingWidget.content : newWidget.content}
                      onChange={(e) => handleWidgetChange('content', e.target.value)}
                      placeholder={`Enter ${(editingWidget?.type || newWidget.type) === "html" ? "HTML" : "component code"}`}
                      className="mt-1 font-mono"
                      rows={10}
                    />
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingWidget(null);
                    setNewWidget({
                      name: "",
                      description: "",
                      location: "homepage",
                      type: "html",
                      content: "",
                      active: true,
                      metadata: {}
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveWidget}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingWidget ? 'Update Widget' : 'Create Widget'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedWidgetsManagement;
