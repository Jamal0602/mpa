import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileType, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { verifyUserBalance, deductUserPoints, simulateUploadProgress } from "./UploadService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [deadline, setDeadline] = useState<Date | undefined>(addDays(new Date(), 3));
  const [expeditedService, setExpeditedService] = useState(false);
  const [expeditedDays, setExpeditedDays] = useState(0);
  const [projectCategory, setProjectCategory] = useState("general");
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  
  const BASE_PRICE = 20;
  const EXPEDITED_DISCOUNT_PERCENT = 25;
  
  const calculatePrice = () => {
    if (!expeditedService) return BASE_PRICE;
    
    const expeditedPrice = BASE_PRICE * (1 + (expeditedDays * EXPEDITED_DISCOUNT_PERCENT / 100));
    return expeditedPrice;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
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
  
  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("Please provide a title and select a file");
      return;
    }
    
    const price = calculatePrice();
    
    const hasEnoughPoints = await verifyUserBalance(userId, price);
    
    if (!hasEnoughPoints) {
      setInsufficientFunds(true);
      return;
    }
    
    setShowPaymentConfirmation(true);
  };
  
  const processUpload = async () => {
    try {
      setUploading(true);
      const cleanStop = simulateUploadProgress(setProgress);
      
      const fileExt = file!.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: storageData } = await supabase.storage
        .from("projects")
        .upload(fileName, file!);
        
      if (uploadError) {
        cleanStop();
        setUploading(false);
        setProgress(0);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from("projects")
        .getPublicUrl(fileName);
      
      const fileUrl = publicUrlData?.publicUrl || '';
      
      const price = calculatePrice();
      
      const deductSuccessful = await deductUserPoints(
        userId, 
        price, 
        `Service charge for project: ${title}`
      );
      
      if (!deductSuccessful) {
        throw new Error("Failed to process payment");
      }
      
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          type: projectType,
          category: projectCategory,
          file_path: fileName,
          file_type: file!.type,
          file_size: file!.size,
          file_url: fileUrl,
          owner_id: userId,
          status: 'pending',
          deadline: deadline?.toISOString(),
          expedited: expeditedService,
          expedited_days: expeditedDays,
          price
        });
        
      if (projectError) throw projectError;
      
      await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Project Uploaded",
          message: `Your project "${title}" has been uploaded successfully and is pending review. ${expeditedService ? 'Expedited processing requested.' : ''}`,
          type: "success"
        });
        
      cleanStop();
      setProgress(100);
      
      toast.success("Project uploaded successfully!");
      
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setProjectType("idea");
        setProjectCategory("general");
        setFile(null);
        setDeadline(addDays(new Date(), 3));
        setExpeditedService(false);
        setExpeditedDays(0);
        setProgress(0);
        setUploading(false);
        onSuccess();
        navigate("/");
      }, 1500);
      
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Share your ideas, files, or projects with the MPA community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insufficientFunds && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Spark Points</AlertTitle>
              <AlertDescription>
                You don't have enough Spark Points for this service. 
                Required: {calculatePrice()} points. Your balance: {userPoints} points.
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => navigate('/subscription')}
                >
                  Add more points
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
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
            <Label htmlFor="category">Project Category</Label>
            <Select
              value={projectCategory}
              onValueChange={setProjectCategory}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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
            <Label>Deadline</Label>
            <div className="flex flex-col space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="expedited"
                  checked={expeditedService}
                  onCheckedChange={(checked) => {
                    setExpeditedService(!!checked);
                    if (!checked) setExpeditedDays(0);
                  }}
                />
                <label 
                  htmlFor="expedited" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Expedited service (+{EXPEDITED_DISCOUNT_PERCENT}% per day)
                </label>
              </div>
              
              {expeditedService && (
                <div className="space-y-2">
                  <Label htmlFor="expeditedDays">Days to reduce</Label>
                  <Select
                    value={expeditedDays.toString()}
                    onValueChange={(value) => setExpeditedDays(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day (-24h)</SelectItem>
                      <SelectItem value="2">2 days (-48h)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-2 text-sm font-medium">
                    Total price: ${calculatePrice().toFixed(2)}
                  </div>
                </div>
              )}
            </div>
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
            disabled={uploading || !title || !file}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Project"}
          </Button>
        </CardFooter>
      </Card>
      
      <PaymentConfirmation
        open={showPaymentConfirmation}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={processUpload}
        title="Confirm Service Payment"
        description="Please confirm the payment for your project upload service."
        amount={calculatePrice()}
        currency="SP"
        itemName={`Project Upload Service${expeditedService ? ' (Expedited)' : ''}`}
      />
    </>
  );
};
