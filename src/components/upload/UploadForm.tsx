
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UploadFormProps {
  userId: string;
  onUploadSuccess: () => void;
  userPoints?: number;
  onSuccess?: () => void;
  serviceMode?: boolean;
}

export const UploadForm = ({ userId, onUploadSuccess, userPoints, onSuccess, serviceMode = false }: UploadFormProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleFileUpload = async (file: File, userId: string) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadError(null);

    const fileExt = file.name.split(".").pop();
    const filePath = `projects/${userId}/${Date.now()}.${fileExt}`;

    try {
      // First check if the bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const projectsBucket = buckets?.find(bucket => bucket.name === 'projects');
      
      if (!projectsBucket) {
        // Create the bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('projects', {
          public: true,
          allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          setUploadError("Error creating storage bucket. Please try again.");
          return null;
        }
      }

      const { data, error } = await supabase.storage
        .from("projects")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error);
        setUploadError(error.message);
        toast({
          title: "Upload Failed",
          description: "There was an error uploading your file. " + error.message,
          variant: "destructive",
        });
        return null;
      }

      // Since progress is not available directly, simulate progress
      setUploadProgress(100);
      
      // Return the data
      return data;
    } catch (error: any) {
      console.error("Unexpected error during upload:", error);
      setUploadError(error.message);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred during the upload.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      toast({
        title: "Missing File",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title || !description || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const uploadResult = await handleFileUpload(file, userId);

      if (!uploadResult) {
        setIsSubmitting(false);
        return;
      }

      // Construct file URL correctly
      const { data: urlData } = supabase.storage.from("projects").getPublicUrl(uploadResult.path);
      const fileUrl = urlData.publicUrl;
      const fileType = file.type;
      const filePath = uploadResult.path;

      const { error } = await supabase.from("projects").insert({
        title,
        description,
        user_id: userId,
        category,
        file_url: fileUrl,
        file_type: fileType,
        file_path: filePath,
        status: "pending",
        type: "project",
      });

      if (error) {
        console.error("Error submitting project:", error);
        setUploadError(error.message);
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your project: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project Submitted",
        description: "Your project has been submitted successfully!",
      });

      setTitle("");
      setDescription("");
      setCategory("");
      setFile(null);
      if (onSuccess) {
        onSuccess();
      }
      onUploadSuccess();
    } catch (error: any) {
      console.error("Unexpected error during submission:", error);
      setUploadError(error.message);
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred during submission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Project</CardTitle>
        <CardDescription>
          Share your creative projects with our community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                type="text"
                id="title"
                placeholder="Enter project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                placeholder="Enter project category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="file">Upload File</Label>
              <Input
                type="file"
                id="file"
                onChange={handleFileChange}
                required
              />
              {file && (
                <div className="mt-2">
                  Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
                </div>
              )}
            </div>
            {uploadProgress !== null && (
              <div className="mt-4">
                Upload Progress: {uploadProgress.toFixed(2)}%
              </div>
            )}
            {uploadError && <div className="text-red-500 mt-4">Error: {uploadError}</div>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Submit Project
                </>
              )}
            </Button>
          </form>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">
          Please ensure your file is under 10MB and complies with our terms of
          service.
        </p>
      </CardFooter>
    </Card>
  );
};
