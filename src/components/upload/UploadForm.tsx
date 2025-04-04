import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadCloud, FilePlus, Loader2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export interface UploadFormProps {
  userId: string;
  userPoints: number;
  onSuccess?: () => void;
}

export const UploadForm = ({ userId, userPoints, onSuccess }: UploadFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const COST_PER_UPLOAD = 5;
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [terms, setTerms] = useState(false);
  const MINIMUM_DESC_LENGTH = 50;
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File size too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    setErrorMsg("");
    
    // Preview the image if it's an image file
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview("file"); // Set a generic file preview
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };
  
  // Modified project submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    // Validate form fields
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload");
      setIsSubmitting(false);
      return;
    }

    if (description.length < MINIMUM_DESC_LENGTH) {
      setErrorMsg(`Description must be at least ${MINIMUM_DESC_LENGTH} characters long`);
      setIsSubmitting(false);
      return;
    }
    
    if (!terms) {
      setErrorMsg("You must accept the terms and conditions");
      setIsSubmitting(false);
      return;
    }
    
    if (userPoints < COST_PER_UPLOAD) {
      setErrorMsg(`Insufficient Spark Points. You need ${COST_PER_UPLOAD} SP for this upload.`);
      setIsSubmitting(false);
      return;
    }

    try {
      // File upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${userId}/${Math.random().toString(36).slice(2)}.${fileExt}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("projects")
        .upload(filePath, selectedFile);
      
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from("projects")
        .getPublicUrl(filePath);
        
      if (!publicURL) {
        throw new Error("Failed to get public URL for the uploaded file");
      }
      
      // Create a project record
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          title: projectTitle,
          description,
          user_id: userId,
          file_url: publicURL.publicUrl,
          file_path: filePath,
          file_type: selectedFile.type,
          category: selectedCategory,
          type: "upload",
          status: "pending"
        });
        
      if (projectError) {
        throw new Error(projectError.message);
      }
      
      // Deduct key points
      const { error: pointsError } = await supabase.rpc('decrement_points', {
        user_id: userId,
        amount_to_deduct: COST_PER_UPLOAD
      });
      
      if (pointsError) throw new Error(pointsError.message);
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from("key_points_transactions")
        .insert({
          user_id: userId,
          amount: -COST_PER_UPLOAD,
          description: `Project upload: ${projectTitle}`,
          transaction_type: 'spend'
        });
      
      if (transactionError) throw new Error(transactionError.message);
      
      toast.success("Project submitted successfully", {
        description: "Your project has been submitted for review"
      });
      
      // Reset form and close dialog
      setProjectTitle("");
      setDescription("");
      setSelectedCategory("");
      setSelectedFile(null);
      setFilePreview("");
      setUploadDialogOpen(false);
      setTerms(false);
      
      // Call the onSuccess callback to refresh parent component
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMsg(`Error: ${error.message}`);
      toast.error("Upload failed", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="md:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Project</CardTitle>
          <CardDescription>
            Submit your project for processing. Each upload costs {COST_PER_UPLOAD} Spark Points.
          </CardDescription>
        </CardHeader>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="mx-6 mb-4" 
              disabled={userPoints < COST_PER_UPLOAD}
            >
              Start New Upload
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit Your Project</DialogTitle>
              <DialogDescription>
                This will use {COST_PER_UPLOAD} Spark Points from your account. Make sure all details are correct.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description ({description.length}/{MINIMUM_DESC_LENGTH}+ characters)
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about your project..."
                    className={`min-h-[100px] ${description.length < MINIMUM_DESC_LENGTH ? 'border-red-300' : ''}`}
                    required
                  />
                  {description.length < MINIMUM_DESC_LENGTH && (
                    <p className="text-xs text-red-500">
                      Description must be at least {MINIMUM_DESC_LENGTH} characters long
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">File Format</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select file format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document (PDF, DOCX)</SelectItem>
                      <SelectItem value="image">Image (JPG, PNG)</SelectItem>
                      <SelectItem value="video">Video (MP4, MOV)</SelectItem>
                      <SelectItem value="audio">Audio (MP3, WAV)</SelectItem>
                      <SelectItem value="archive">Archive (ZIP, RAR)</SelectItem>
                      <SelectItem value="presentation">Presentation (PPT, PPTX)</SelectItem>
                      <SelectItem value="spreadsheet">Spreadsheet (XLS, XLSX)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <div className="flex flex-col space-y-2">
                    <div
                      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer ${
                        isDragging
                          ? "border-primary bg-primary/10"
                          : "border-muted-foreground/25"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {filePreview ? (
                        <div className="w-full flex flex-col items-center">
                          {selectedFile?.type.startsWith("image/") ? (
                            <div className="relative w-full max-w-xs h-32 mb-2">
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="p-4 bg-muted/50 rounded-md">
                              <FilePlus className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-sm mt-2 text-center">
                            {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile();
                            }}
                          >
                            Change file
                          </Button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground text-center">
                            Drag & drop your file here, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            Maximum file size: 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav,.zip,.rar,.ppt,.pptx,.xls,.xlsx"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={terms}
                    onCheckedChange={(checked) => setTerms(checked === true)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm that all submission details are correct and understand that uploads with incorrect information may be rejected
                  </label>
                </div>

                {errorMsg && (
                  <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedFile || description.length < MINIMUM_DESC_LENGTH || !terms || userPoints < COST_PER_UPLOAD}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Project"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-md p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                How it works
              </h3>
              
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Submit your project with all required details</li>
                <li>Our team reviews your submission (typically 24-48 hours)</li>
                <li>You'll receive a notification once processing is complete</li>
                <li>Results will be available in your dashboard</li>
              </ol>
            </div>
            
            <div className="bg-muted/40 rounded-md p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Important Notes
              </h3>
              
              <ul className="space-y-2 text-sm">
                <li>Each upload costs {COST_PER_UPLOAD} Spark Points</li>
                <li>Maximum file size: 10MB</li>
                <li>Supported formats: PDF, DOC, DOCX, JPG, PNG, MP4, MP3, and more</li>
                <li>Incomplete or incorrect submissions may be rejected</li>
                <li>Need help? <Link to="/help" className="text-primary underline">Contact support</Link></li>
              </ul>
            </div>
            
            {userPoints < COST_PER_UPLOAD && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4">
                <h3 className="font-semibold mb-2 text-yellow-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Insufficient Points
                </h3>
                
                <p className="text-sm mb-3">
                  You don't have enough Spark Points for this upload. You need {COST_PER_UPLOAD} SP.
                </p>
                
                <Link to="/subscription">
                  <Button variant="outline" className="w-full">
                    Get More Spark Points
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
