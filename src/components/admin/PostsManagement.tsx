
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, Eye, Plus, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  published: boolean;
  featured?: boolean;
  excerpt?: string;
  thumbnail_url?: string;
  category?: string;
}

export function PostsManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: true,
    featured: false,
    thumbnail_url: "",
    category: ""
  });

  const categories = [
    "Announcement",
    "Tutorial",
    "News",
    "Feature",
    "Update",
    "Community"
  ];

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Post[];
    },
  });

  const handleCreatePost = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      published: true,
      featured: false,
      thumbnail_url: "",
      category: ""
    });
    setSelectedPost(null);
    setIsDialogOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      published: post.published,
      featured: post.featured || false,
      thumbnail_url: post.thumbnail_url || "",
      category: post.category || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleFeatured = async (post: Post) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          featured: !post.featured,
          updated_at: new Date().toISOString()
        })
        .eq("id", post.id);
        
      if (error) throw error;
      toast.success(`Post ${post.featured ? 'removed from' : 'added to'} featured list!`);
      refetch();
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!user) return;

      // Validation
      if (!formData.title.trim()) {
        toast.error("Title is required");
        return;
      }

      if (!formData.content.trim()) {
        toast.error("Content is required");
        return;
      }

      if (selectedPost) {
        // Update existing post
        const { error } = await supabase
          .from("posts")
          .update({
            title: formData.title,
            content: formData.content,
            published: formData.published,
            featured: formData.featured,
            excerpt: formData.excerpt || null,
            thumbnail_url: formData.thumbnail_url || null,
            category: formData.category || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedPost.id);
          
        if (error) throw error;
        toast.success("Post updated successfully!");
      } else {
        // Create new post
        const { error } = await supabase
          .from("posts")
          .insert({
            title: formData.title,
            content: formData.content,
            published: formData.published,
            featured: formData.featured,
            excerpt: formData.excerpt || null,
            thumbnail_url: formData.thumbnail_url || null,
            category: formData.category || null,
            user_id: user.id
          });
          
        if (error) throw error;
        toast.success("Post created successfully!");
      }
      
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedPost) return;
      
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", selectedPost.id);
        
      if (error) throw error;
      toast.success("Post deleted successfully!");
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const viewPost = (post: Post) => {
    navigate(`/post/${post.id}`);
  };

  const getFilteredPosts = () => {
    if (!posts) return [];
    
    switch (activeTab) {
      case "published":
        return posts.filter((post) => post.published);
      case "drafts":
        return posts.filter((post) => !post.published);
      case "featured":
        return posts.filter((post) => post.featured);
      default:
        return posts;
    }
  };

  const filteredPosts = getFilteredPosts();

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Posts Management</h2>
        <Button onClick={handleCreatePost} className="gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col">
                  {post.thumbnail_url && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={post.thumbnail_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                      <div className="flex gap-1">
                        {!post.published && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Draft
                          </Badge>
                        )}
                        {post.featured && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {new Date(post.created_at).toLocaleDateString()}
                      {post.category && ` • ${post.category}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt || post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <span>👍 {post.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="ghost" size="sm" onClick={() => viewPost(post)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleFeatured(post)}
                        title={post.featured ? "Remove from featured" : "Add to featured"}
                      >
                        {post.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirmation(post)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p>No posts found. {activeTab === "all" ? "Create your first post!" : `No ${activeTab} posts available.`}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {selectedPost ? "Make changes to your post here." : "Create a new post to share with the community."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Post title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                placeholder="Short description for this post..."
                rows={2}
                value={formData.excerpt}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your post content here..."
                className="min-h-[200px]"
                value={formData.content}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                name="thumbnail_url"
                placeholder="https://example.com/image.jpg"
                value={formData.thumbnail_url}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => handleSwitchChange("published", checked)}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {selectedPost ? "Save Changes" : "Create Post"}
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
              Are you sure you want to delete this post? This action cannot be undone.
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
