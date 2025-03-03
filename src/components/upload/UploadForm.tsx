
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileType } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface UploadFormProps {
  userId: string;
  userPoints: number;
  onSuccess: () => void;
}

export const UploadForm = ({ userId, userPoints, onSuccess }: UploadFormProps) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("idea");
  const [file, setFile] = useState<File | null>(null);
  
  const UPLOAD_COST = 5;
  const hasEnoughPoints = userPoints >= UPLOAD_COST;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Check file size (limit to 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit. Please select a smaller file.");
        return;
      }
      setFile(selectedFile);
    }
  };
  
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "Image";
    if (fileType.startsWith("video/")) return "Video";
    if (fileType.startsWith("audio/")) return "Audio";
    if (fileType === "application/pdf") return "PDF";
    if (fileType.includes("document") || fileType.includes("sheet")) return "Document";
    return "Other";
  };
  
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 95) {
        progress = 95;
        clearInterval(interval);
      }
      setProgress(Math.min(progress, 95));
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("Please provide a title and select a file");
      return;
    }
    
    if (!hasEnoughPoints) {
      toast.error(`You need at least ${UPLOAD_COST} Key Points to upload. You have ${userPoints}.`);
      return;
    }
    
    try {
      setUploading(true);
      const cleanStop = simulateProgress();
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: storageData } = await supabase.storage
        .from("projects")
        .upload(fileName, file);
        
      if (uploadError) {
        cleanStop();
        setUploading(false);
        setProgress(0);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }
      
      // Generate public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from("projects")
        .getPublicUrl(fileName);
      
      const fileUrl = publicUrlData?.publicUrl || '';
      
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          type: projectType,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          file_url: fileUrl,
          owner_id: userId,
          status: 'pending'
        });
        
      if (projectError) throw projectError;
      
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ key_points: userPoints - UPLOAD_COST })
        .eq("id", userId);
        
      if (pointsError) throw pointsError;
      
      await supabase
        .from("key_points_transactions")
        .insert({
          user_id: userId,
          amount: -UPLOAD_COST,
          description: `Project upload: ${title}`,
          transaction_type: 'spend'
        });
        
      // Create notification for the user
      await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Project Uploaded",
          message: `Your project "${title}" has been uploaded successfully and is pending review.`,
          type: "success"
        });
        
      cleanStop();
      setProgress(100);
      
      toast.success("Project uploaded successfully!");
      
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setProjectType("idea");
        setFile(null);
        setProgress(0);
        setUploading(false);
        onSuccess();
        navigate("/"); // Redirect to home page after upload
      }, 1500);
      
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>
          Share your ideas, files, or projects with the MPA community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your project"
            disabled={uploading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project"
            disabled={uploading}
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Project Type</Label>
          <Select
            value={projectType}
            onValueChange={setProjectType}
            disabled={uploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">Idea</SelectItem>
              <SelectItem value="prototype">Prototype</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="resource">Resource</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <div className="border rounded-md p-4 bg-background">
            {file ? (
              <div className="flex items-center gap-3">
                <FileType className="h-10 w-10 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {getFileTypeIcon(file.type)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
            )}
          </div>
        </div>
        
        {uploading && (
          <div className="space-y-2">
            <Label>Upload Progress</Label>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {progress < 100 ? "Uploading..." : "Upload Complete!"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={uploading || !hasEnoughPoints || !title || !file}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Project"}
        </Button>
      </CardFooter>
    </Card>
  );
};
