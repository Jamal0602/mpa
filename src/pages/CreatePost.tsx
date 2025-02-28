
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingPage } from "@/components/ui/loading";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImage, Save, ArrowLeft } from "lucide-react";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [isMasterMind, setIsMasterMind] = useState(false);

  const checkIsMasterMind = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data.username === "mastermind";
    } catch (error) {
      console.error("Error checking MasterMind status:", error);
      return false;
    }
  };

  useState(() => {
    const checkAdmin = async () => {
      const result = await checkIsMasterMind();
      setIsMasterMind(result);
    };
    
    checkAdmin();
  });

  if (isAdminLoading) {
    return <LoadingPage />;
  }

  // Only admin users can create posts
  if (!user || !isAdmin) {
    navigate("/");
    toast.error("You don't have permission to create posts");
    return null;
  }

  const validateForm = () => {
    let isValid = true;
    setTitleError("");
    setContentError("");

    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    }

    if (!content.trim()) {
      setContentError("Content is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("posts").insert({
        title,
        content,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Post created successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAccessDenied = isAdmin && !isMasterMind;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>

        {showAccessDenied ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Only the MasterMind account can create posts. Please contact the administrator.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title"
                    className={titleError ? "border-destructive" : ""}
                  />
                  {titleError && <p className="text-xs text-destructive">{titleError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter post content"
                    rows={10}
                    className={contentError ? "border-destructive" : ""}
                  />
                  {contentError && <p className="text-xs text-destructive">{contentError}</p>}
                </div>

                <div className="px-4 py-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileImage className="h-4 w-4" />
                    <p>Future version will support image uploads</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Post
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
