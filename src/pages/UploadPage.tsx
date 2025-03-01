
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, FileType, CreditCard, AlertTriangle } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("idea");
  const [file, setFile] = useState<File | null>(null);
  
  // Fetch user's key points
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-points", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("key_points")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Load the forms.app embed script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://forms.app/static/embed.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  if (isLoading) return <LoadingPage />;
  
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  const UPLOAD_COST = 5; // Cost in Key Points for an upload
  const hasEnoughPoints = (profile?.key_points || 0) >= UPLOAD_COST;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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
      toast.error(`You need at least ${UPLOAD_COST} Key Points to upload. You have ${profile?.key_points || 0}.`);
      return;
    }
    
    try {
      setUploading(true);
      const cleanStop = simulateProgress();
      
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("projects")
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Create project record
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          type: projectType,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          owner_id: user.id
        });
        
      if (projectError) throw projectError;
      
      // Deduct key points
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ key_points: (profile?.key_points || 0) - UPLOAD_COST })
        .eq("id", user.id);
        
      if (pointsError) throw pointsError;
      
      // Record transaction
      await supabase
        .from("key_points_transactions")
        .insert({
          user_id: user.id,
          amount: -UPLOAD_COST,
          description: `Project upload: ${title}`,
          transaction_type: 'spend'
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
      }, 1500);
      
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Your Project</h1>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="upload">Direct Upload</TabsTrigger>
            <TabsTrigger value="form">Form Submission</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Cost</CardTitle>
                    <CardDescription>
                      Key Points required for this upload
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-medium">{UPLOAD_COST} Key Points</span>
                      </div>
                      <Badge variant={hasEnoughPoints ? "default" : "destructive"}>
                        {hasEnoughPoints ? "Available" : "Insufficient"}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 text-sm">
                      Your balance: <span className="font-medium">{profile?.key_points || 0} Points</span>
                    </div>
                  </CardContent>
                </Card>
                
                {!hasEnoughPoints && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Insufficient Key Points</AlertTitle>
                    <AlertDescription>
                      You need at least {UPLOAD_COST} Key Points to upload. Earn more by engaging with the platform.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>• Maximum file size: 100MB</p>
                    <p>• Supported formats: PDF, images, documents, videos</p>
                    <p>• All uploads are reviewed by moderators</p>
                    <p>• Inappropriate content will be removed</p>
                    <p>• You must own the rights to uploaded content</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Project Submission Form</CardTitle>
                <CardDescription>
                  Use this embedded form to submit your project details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="formsappWrapper rounded-lg overflow-hidden bg-card"
                  style={{ height: "800px" }}
                >
                  {/* This div will be populated by the forms.app script */}
                  <div
                    data-formapp-id="64fc5aa6b02x8ea4cc983520"
                    className="formsappIframe"
                  ></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UploadPage;
