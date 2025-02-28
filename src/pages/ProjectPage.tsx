
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Download, User, Calendar, FileType, MessageCircle, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner: {
    username: string;
    avatar_url: string | null;
  }[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    username: string;
    avatar_url: string | null;
  }[];
}

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles(username, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Project;
    },
  });

  const { data: comments, isLoading: isCommentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ["project-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleDownload = async () => {
    if (!project) return;

    try {
      const { data, error } = await supabase.storage
        .from("projects")
        .download(project.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = project.title + "." + project.file_path.split(".").pop();
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error("Failed to download file: " + error.message);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        content: comment,
        project_id: id,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Comment added successfully");
      setComment("");
      refetchComments();
    } catch (error: any) {
      toast.error("Failed to add comment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isProjectLoading) {
    return <LoadingPage />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const fileSize = (size: number) => {
    if (size < 1024) return size + " bytes";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    else return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "Image";
    else if (fileType.startsWith("video/")) return "Video";
    else if (fileType.startsWith("audio/")) return "Audio";
    else if (fileType === "application/pdf") return "PDF";
    else if (fileType.includes("document") || fileType.includes("sheet")) return "Document";
    else return "Other";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline">{project.type}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{project.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center">
                  <FileType className="h-5 w-5 mr-2 text-primary" />
                  <span>{getFileIcon(project.file_type)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {fileSize(project.file_size)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {project.file_type}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={project.owner[0]?.avatar_url || ""} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.owner[0]?.username || "Unknown User"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Comments</CardTitle>
                <Badge variant="outline">{comments?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {user ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="mb-2"
                  />
                  <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </form>
              ) : (
                <div className="bg-muted p-4 rounded-md mb-6">
                  <p className="text-sm text-muted-foreground">
                    Please sign in to leave a comment.
                  </p>
                </div>
              )}

              {isCommentsLoading ? (
                <div className="text-center py-4">Loading comments...</div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-md p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.user[0]?.avatar_url || ""} />
                          <AvatarFallback>
                            {comment.user[0]?.username[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {comment.user[0]?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share Project
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Owner
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
