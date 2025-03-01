
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, Briefcase, Award, Clock, Upload, Info, FileText } from "lucide-react";

export default function WorkWithUs() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [location, setLocation] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [category, setCategory] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Get user data and populate form
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setEmail(data.session.user.email);
        setFullName(data.session.user.user_metadata.full_name || "");
        
        // Fetch profile data to auto-fill location
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("country, state, district, place")
          .eq("id", data.session.user.id)
          .single();
          
        if (!error && profileData) {
          const locationParts = [];
          if (profileData.place) locationParts.push(profileData.place);
          if (profileData.district) locationParts.push(profileData.district);
          if (profileData.state) locationParts.push(profileData.state);
          if (profileData.country) locationParts.push(profileData.country);
          
          setLocation(locationParts.join(", "));
        }
      }
      setLoading(false);
    };
    
    checkSession();
  }, []);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    try {
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-resume-${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);
      setResumeUrl(data.publicUrl);
      
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload resume. Please try again.");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to apply");
      navigate("/auth");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Using custom fetch instead of direct supabase call since the table might not be in the types
      const apiUrl = `https://yblcuyelcpgqlaxqlwnl.supabase.co/rest/v1/job_applications`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibGN1eWVsY3BncWxheHFsd25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDI3MjcsImV4cCI6MjA1NTk3ODcyN30.wH54y3saOsBNldjg4xTmFsmtW6s7WN1q4CmoBgAb0I0',
          'Authorization': `Bearer ${supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`
        },
        body: JSON.stringify({
          user_id: user.id,
          full_name: fullName,
          email: email,
          age: age,
          location: location,
          portfolio_link: portfolioLink,
          resume_url: resumeUrl,
          category: category,
          specialization: specialization,
          experience: experience,
          skills: skills,
          availability: availability,
          message: message,
          status: "pending"
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
        
      setSubmitted(true);
      toast.success("Application Submitted Successfully");
      
      // Create notification for the user
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Application Received",
        message: "Thank you for applying to work with us! We'll review your application and get back to you soon.",
        type: "success"
      });
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Submission Failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Work With Us</h1>
      <p className="text-center text-muted-foreground mb-8">
        Join our team of talented professionals and contribute to amazing projects
      </p>
      
      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        <div>
          {submitted ? (
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-center">Application Submitted!</CardTitle>
                <CardDescription className="text-center">
                  Thank you for your interest in working with us. We'll review your application and get back to you soon.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p>Application Reference: <span className="font-medium">{new Date().getTime().toString(36).toUpperCase()}</span></p>
                <p>We've sent a confirmation to your email: <span className="font-medium">{email}</span></p>
                
                <div className="bg-muted p-4 rounded-md mt-6">
                  <h3 className="font-medium mb-2">What happens next?</h3>
                  <ol className="text-sm text-left space-y-2 list-decimal list-inside">
                    <li>Our team will review your application (usually within 3-5 business days)</li>
                    <li>We'll reach out for an interview if your skills match our requirements</li>
                    <li>After successful interviews, we'll discuss project assignments and payment terms</li>
                    <li>Welcome to the MPA team!</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button onClick={() => navigate("/")}>
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Submit Another Application
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                <CardDescription>
                  Please fill out the form below to apply. Fields marked with an asterisk (*) are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Personal Information</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="age">
                          Age <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          min="18"
                          max="100"
                          value={age || ""}
                          onChange={(e) => setAge(parseInt(e.target.value) || undefined)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">
                          Location <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Professional Details</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={category}
                          onValueChange={setCategory}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content_media">Content & Media</SelectItem>
                            <SelectItem value="3d_cad">3D & CAD Design</SelectItem>
                            <SelectItem value="web_dev">Web Development</SelectItem>
                            <SelectItem value="automation">Automation & Bots</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialization">
                          Specialization <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={specialization}
                          onValueChange={setSpecialization}
                          required
                          disabled={!category}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={category ? "Select specialization" : "Select category first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {category === "content_media" && (
                              <>
                                <SelectItem value="document_processor">Document Processor</SelectItem>
                                <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                                <SelectItem value="video_editor">Video Editor</SelectItem>
                              </>
                            )}
                            {category === "3d_cad" && (
                              <>
                                <SelectItem value="3d_modeler">3D Modeler</SelectItem>
                                <SelectItem value="autocad_designer">AutoCAD Designer</SelectItem>
                              </>
                            )}
                            {category === "web_dev" && (
                              <>
                                <SelectItem value="web_designer">Web Designer (HTML & CSS)</SelectItem>
                                <SelectItem value="js_developer">JavaScript Developer</SelectItem>
                                <SelectItem value="backend_developer">Backend Developer</SelectItem>
                              </>
                            )}
                            {category === "automation" && (
                              <SelectItem value="bot_developer">Bot Developer</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="experience">
                          Years of Experience <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={experience}
                          onValueChange={setExperience}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">Less than 1 year</SelectItem>
                            <SelectItem value="1-2">1-2 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5+">More than 5 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="availability">
                          Availability <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={availability}
                          onValueChange={setAvailability}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="weekends">Weekends only</SelectItem>
                            <SelectItem value="flexible">Flexible hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="skills">
                        Key Skills <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="skills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="List your relevant skills (e.g., Photoshop, AutoCAD, JavaScript, React, etc.)"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="portfolioLink">Portfolio Link</Label>
                      <Input
                        id="portfolioLink"
                        type="url"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        placeholder="https://your-portfolio.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="resume">
                        Resume/CV <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          ref={fileInputRef}
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          required={!resumeUrl}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={triggerFileInput}
                          className="flex-1"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Resume
                        </Button>
                        {resumeUrl && (
                          <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => window.open(resumeUrl, "_blank")}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Uploaded File
                          </Button>
                        )}
                      </div>
                      {resumeUrl && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ✓ Resume successfully uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Additional Information <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us why you'd like to work with us and any other information that might be relevant to your application."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms === true}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal">
                      I agree to the MPA terms and conditions. I understand that payments are made after completion of projects, not on a monthly basis.
                    </Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-primary" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="space-y-2">
                <p className="font-medium">For standard projects:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Payment after completion of 3 successful projects</li>
                  <li>Project-based payments, not monthly salary</li>
                  <li>Payments processed within 7 business days after project approval</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">For large projects:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Payment after completion of the first project</li>
                  <li>Milestone-based payments for projects over 30 days</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/50 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
                <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                  All payments are made in Spark Points which can be redeemed for services or withdrawn according to our policies.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="job-categories">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Job Categories
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div>
                  <h3 className="font-medium text-sm mb-1">Content & Media Specialists</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Document Processor – Handles Word, Excel, and PowerPoint tasks</li>
                    <li>Graphic Designer – Edits photos and creates design elements</li>
                    <li>Video Editor – Edits short and long-form videos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">3D & CAD Designers</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>3D Modeler – Creates 3D objects and circuits</li>
                    <li>AutoCAD Designer – Works on 2D and 3D AutoCAD projects</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">Web Development Team</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Web Designer – Designs websites with HTML & CSS</li>
                    <li>JavaScript Developer – Develops website interactivity and widgets</li>
                    <li>Backend Developer – Manages website hosting, databases, and automation</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">Automation & Bot Developers</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Bot Developer – Builds WhatsApp, Instagram, and Discord bots</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="requirements">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Qualifications
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  We're looking for talented individuals with the following qualifications:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Relevant skills and experience in the applied category</li>
                  <li>Ability to work independently and meet deadlines</li>
                  <li>Strong communication skills</li>
                  <li>Portfolio of previous work (for design and development roles)</li>
                  <li>Attention to detail and commitment to quality</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="process">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Process & Timeline
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  Our selection process typically follows these steps:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                  <li>Application review (3-5 business days)</li>
                  <li>Initial interview (for shortlisted candidates)</li>
                  <li>Skills assessment or test project</li>
                  <li>Final interview and discussion of terms</li>
                  <li>Onboarding and project assignment</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  The entire process usually takes 2-3 weeks depending on the position and current demand.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
