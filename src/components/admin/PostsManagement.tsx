
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2, Eye, Plus } from "lucide-react";
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
}

export function PostsManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: true
  });

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
      published: true
    });
    setSelectedPost(null);
    setIsDialogOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      published: post.published
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, published: checked }));
  };

  const handleSubmit = async () => {
    try {
      if (!user) return;

      if (selectedPost) {
        // Update existing post
        const { error } = await supabase
          .from("posts")
          .update({
            title: formData.title,
            content: formData.content,
            published: formData.published,
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

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Posts Management</h2>
        <Button onClick={handleCreatePost} className="gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                  {!post.published && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Draft
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {new Date(post.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {post.content}
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
            <p>No posts found. Create your first post!</p>
          </div>
        )}
      </div>

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
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="published">Published</Label>
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
