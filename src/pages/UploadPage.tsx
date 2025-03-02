
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, FileType, CreditCard, AlertTriangle, HelpCircle, Info } from "lucide-react";
import { LoadingPage } from "@/components/ui/loading";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("idea");
  const [file, setFile] = useState<File | null>(null);
  
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
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://forms.app/static/embed.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  useEffect(() => {
    // Check authentication and redirect if not logged in
    if (!user && !isLoading) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) return <LoadingPage />;
  
  // Don't render content if not authenticated
  if (!user) return <LoadingPage />;
  
  const UPLOAD_COST = 5;
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
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("projects")
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
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
      
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ key_points: (profile?.key_points || 0) - UPLOAD_COST })
        .eq("id", user.id);
        
      if (pointsError) throw pointsError;
      
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
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="upload">Direct Upload</TabsTrigger>
            <TabsTrigger value="form">Form Submission</TabsTrigger>
            <TabsTrigger value="services">Service Pricing</TabsTrigger>
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
                  <div
                    data-formapp-id="64fc5aa6b02x8ea4cc983520"
                    className="formsappIframe"
                  ></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Service Pricing
                </CardTitle>
                <CardDescription>
                  Our services are priced in Spark Points (SP). Submit requests via the form tab.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="document-media">
                    <AccordionTrigger>Document & Media Services</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>Word Processing</span>
                          <Badge variant="secondary">10 SP per page</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>Excel Work</span>
                          <Badge variant="secondary">15 SP per 10×10 sheet</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>Presentation Slides</span>
                          <Badge variant="secondary">10 SP per slide</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>Photo Editing</span>
                          <Badge variant="secondary">35 SP per image</Badge>
                        </li>
                        <li className="py-1 border-b">
                          <div className="flex justify-between items-center">
                            <span>Video Editing</span>
                          </div>
                          <ul className="pl-6 mt-2 space-y-1">
                            <li className="flex justify-between items-center">
                              <span className="text-sm">Up to 10 min</span>
                              <Badge variant="secondary">80 SP</Badge>
                            </li>
                            <li className="flex justify-between items-center">
                              <span className="text-sm">YouTube Shorts</span>
                              <Badge variant="secondary">8 SP</Badge>
                            </li>
                            <li className="flex justify-between items-center">
                              <span className="text-sm">Long Video (30 min)</span>
                              <Badge variant="secondary">200 SP</Badge>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="3d-cad">
                    <AccordionTrigger>3D & CAD Services</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>3D Object Modeling</span>
                          <Badge variant="secondary">50 SP per object</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>3D Circuit Design</span>
                          <Badge variant="secondary">100 SP per circuit</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>AutoCAD 2D Design</span>
                          <Badge variant="secondary">100 to 350 SP</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>AutoCAD 3D Design</span>
                          <Badge variant="secondary">200 to 800 SP</Badge>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="web-dev">
                    <AccordionTrigger>Web Development & Hosting</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        <li className="py-1 border-b">
                          <div className="flex justify-between items-center">
                            <span>Website Hosting on Blog</span>
                          </div>
                          <ul className="pl-6 mt-2 space-y-1">
                            <li className="flex justify-between items-center">
                              <span className="text-sm">Advanced Setup</span>
                              <Badge variant="secondary">100 SP</Badge>
                            </li>
                            <li className="flex justify-between items-center">
                              <span className="text-sm">Monthly Maintenance</span>
                              <Badge variant="secondary">50 SP</Badge>
                            </li>
                          </ul>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>Web Design (HTML & CSS only)</span>
                          <Badge variant="secondary">70 SP</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>Website Widget Development</span>
                          <Badge variant="secondary">35 SP</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>HTML Coding</span>
                          <Badge variant="secondary">35 SP per 100 lines</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>CSS Coding</span>
                          <Badge variant="secondary">35 SP per 400 lines</Badge>
                        </li>
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>JavaScript Functions</span>
                          <Badge variant="secondary">4 SP per function</Badge>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="automation">
                    <AccordionTrigger>Automation & Bots</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        <li className="flex justify-between items-center py-1 border-b">
                          <span>WhatsApp, Instagram, Discord Bots</span>
                          <Badge variant="secondary">200 SP</Badge>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-6">
                  <Link to="/subscription">
                    <Button className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Spark Points
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Have questions? <Link to="/help" className="ml-1 text-primary hover:underline">Get help</Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UploadPage;
