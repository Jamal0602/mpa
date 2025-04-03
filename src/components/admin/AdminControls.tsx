
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export const AdminControls = () => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newWidget, setNewWidget] = useState({ 
    title: "", 
    description: "",
    type: "stats" as const,
    code: "",
    settings: {}
  });

  const { data: posts, refetch: refetchPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: widgets, refetch: refetchWidgets, isLoading: isLoadingWidgets } = useQuery({
    queryKey: ["admin-widgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleCreatePost = async () => {
    try {
      if (!newPost.title || !newPost.content) {
        throw new Error("Please fill in all required fields");
      }

      if (!user) {
        throw new Error("You must be logged in to create posts");
      }

      const { error } = await supabase.from("posts").insert({
        title: newPost.title,
        content: newPost.content,
        user_id: user.id
      });
      if (error) throw error;
      toast.success("Post created successfully");
      setIsCreateOpen(false);
      setNewPost({ title: "", content: "" });
      refetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreateWidget = async () => {
    try {
      if (!newWidget.title || !newWidget.description || !newWidget.type) {
        throw new Error("Please fill in all required fields");
      }

      if (!user) {
        throw new Error("You must be logged in to create widgets");
      }

      if (["html", "javascript"].includes(newWidget.type) && !newWidget.code) {
        throw new Error("Code is required for HTML and JavaScript widgets");
      }

      const { error } = await supabase.from("widgets").insert({
        title: newWidget.title,
        description: newWidget.description,
        type: newWidget.type,
        code: newWidget.code,
        settings: newWidget.settings,
        created_by: user.id
      });
      if (error) throw error;
      toast.success("Widget created successfully");
      setIsCreateOpen(false);
      setNewWidget({ title: "", description: "", type: "stats", code: "", settings: {} });
      refetchWidgets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (type: "post" | "widget", id: string) => {
    try {
      const { error } = await supabase
        .from(type === "post" ? "posts" : "widgets")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success(`${type} deleted successfully`);
      if (type === "post") refetchPosts();
      else refetchWidgets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Controls</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Add a new post or widget to your dashboard
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="post" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="post">Post</TabsTrigger>
                <TabsTrigger value="widget">Widget</TabsTrigger>
              </TabsList>
              <TabsContent value="post" className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Enter post content"
                    rows={5}
                  />
                </div>
                <Button onClick={handleCreatePost} className="w-full">Create Post</Button>
              </TabsContent>
              <TabsContent value="widget" className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newWidget.title}
                    onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                    placeholder="Enter widget title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newWidget.description}
                    onChange={(e) => setNewWidget({ ...newWidget, description: e.target.value })}
                    placeholder="Enter widget description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newWidget.type}
                    onValueChange={(value: any) => setNewWidget({ ...newWidget, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chart">Chart</SelectItem>
                      <SelectItem value="stats">Stats</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="calendar">Calendar</SelectItem>
                      <SelectItem value="html">HTML Widget</SelectItem>
                      <SelectItem value="javascript">JavaScript Widget</SelectItem>
                      <SelectItem value="iframe">iFrame Widget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["html", "javascript", "iframe"].includes(newWidget.type) && (
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Textarea
                      value={newWidget.code}
                      onChange={(e) => setNewWidget({ ...newWidget, code: e.target.value })}
                      placeholder={`Enter ${newWidget.type} code`}
                      rows={8}
                      className="font-mono"
                    />
                  </div>
                )}
                <Button onClick={handleCreateWidget} className="w-full">Create Widget</Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Posts</h3>
          {isLoadingPosts ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id} className="p-4 hover:border-primary/50 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{post.title}</h4>
                        {post.published ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(post.created_at)}</span>
                        <span>•</span>
                        <span>{post.likes || 0} likes</span>
                        <span>•</span>
                        <span>{post.comments || 0} comments</span>
                      </div>
                    </div>
                    <div className="flex gap-2 self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Edit functionality would go here
                          toast.info("Edit functionality coming soon");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete("post", post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No posts found. Create your first post!
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Widgets</h3>
          {isLoadingWidgets ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : widgets && widgets.length > 0 ? (
            <div className="space-y-3">
              {widgets.map((widget) => (
                <Card key={widget.id} className="p-4 hover:border-primary/50 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium">{widget.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{widget.description}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary">{widget.type}</Badge>
                        {widget.code && (
                          <Badge variant="outline">Has Custom Code</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">Created: {formatDate(widget.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Edit functionality would go here
                          toast.info("Edit functionality coming soon");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete("widget", widget.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No widgets found. Create your first widget!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
