
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SPECIALIZATIONS = {
  "content_media": [
    { id: "document_processor", label: "Document Processor" },
    { id: "graphic_designer", label: "Graphic Designer" },
    { id: "video_editor", label: "Video Editor" }
  ],
  "design_3d": [
    { id: "3d_modeler", label: "3D Modeler" },
    { id: "autocad_designer", label: "AutoCAD Designer" }
  ],
  "web_development": [
    { id: "web_designer", label: "Web Designer (HTML & CSS)" },
    { id: "js_developer", label: "JavaScript Developer" },
    { id: "backend_developer", label: "Backend Developer" }
  ],
  "automation": [
    { id: "bot_developer", label: "Bot Developer" }
  ]
};

function WorkWithUs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    location: "",
    portfolioLink: "",
    resumeUrl: "",
    category: "",
    specialization: "",
    experience: "",
    skills: "",
    availability: "",
    message: "",
    agreeToTerms: false
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        fetchUserProfile(data.session.user.id);
      }
    };

    checkSession();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      
      // Prefill form with user data
      setFormData(prevData => ({
        ...prevData,
        fullName: data.full_name || "",
        email: user.email || "",
        location: [data.country, data.state, data.district, data.place]
          .filter(Boolean)
          .join(", ") || "",
      }));
      
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Agreement Required",
        description: "You must agree to the terms and policies to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload resume if provided
      let resumeUrl = formData.resumeUrl;
      if (e.target.resume && e.target.resume.files && e.target.resume.files[0]) {
        const file = e.target.resume.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `resumes/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('applications')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data } = supabase.storage
          .from('applications')
          .getPublicUrl(filePath);
          
        resumeUrl = data.publicUrl;
      }
      
      // Save application to database
      const { error } = await supabase
        .from('job_applications')
        .insert([
          {
            user_id: user.id,
            full_name: formData.fullName,
            email: formData.email,
            age: parseInt(formData.age),
            location: formData.location,
            portfolio_link: formData.portfolioLink,
            resume_url: resumeUrl,
            category: formData.category,
            specialization: formData.specialization,
            experience: formData.experience,
            skills: formData.skills,
            availability: formData.availability,
            message: formData.message,
            status: 'pending'
          }
        ]);
        
      if (error) throw error;
      
      toast({
        title: "Application Submitted!",
        description: "We've received your application and will be in touch soon.",
      });
      
      // Reset form
      setFormData({
        fullName: userProfile?.full_name || "",
        email: user.email || "",
        age: "",
        location: userProfile ? [userProfile.country, userProfile.state, userProfile.district, userProfile.place]
          .filter(Boolean)
          .join(", ") : "",
        portfolioLink: "",
        resumeUrl: "",
        category: "",
        specialization: "",
        experience: "",
        skills: "",
        availability: "",
        message: "",
        agreeToTerms: false
      });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      // Store file info for display purposes only
      const fileName = e.target.files[0].name;
      document.getElementById('file-name').textContent = fileName;
    }
  };

  const handleBrowseClick = () => {
    // Use DOM to trigger file input click
    document.getElementById('resume').click();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Work With Us</h1>
      <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
        Join our talented team of freelancers and professionals. We offer flexible work arrangements and competitive compensation based on your skills and expertise.
      </p>
      
      <Tabs defaultValue="apply">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="apply">Apply</TabsTrigger>
          <TabsTrigger value="positions">Available Positions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Application</CardTitle>
              <CardDescription>
                Fill out the form below to apply for a position with our team.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        min="18"
                        max="80"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="portfolioLink">Portfolio Link (Optional)</Label>
                    <Input
                      id="portfolioLink"
                      name="portfolioLink"
                      type="url"
                      placeholder="https://your-portfolio.com"
                      value={formData.portfolioLink}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="resume"
                        name="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBrowseClick}
                      >
                        Browse
                      </Button>
                      <span id="file-name" className="text-sm text-gray-500">No file selected</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Professional Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      name="category"
                      value={formData.category}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          category: value,
                          specialization: ''  // Reset specialization when category changes
                        });
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content_media">Content & Media Specialists</SelectItem>
                        <SelectItem value="design_3d">3D & CAD Designers</SelectItem>
                        <SelectItem value="web_development">Web Development Team</SelectItem>
                        <SelectItem value="automation">Automation & Bot Developers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.category && (
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Select
                        name="specialization"
                        value={formData.specialization}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            specialization: value
                          });
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALIZATIONS[formData.category]?.map(spec => (
                            <SelectItem key={spec.id} value={spec.id}>
                              {spec.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select
                      name="experience"
                      value={formData.experience}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          experience: value
                        });
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                        <SelectItem value="1_to_3">1-3 years</SelectItem>
                        <SelectItem value="3_to_5">3-5 years</SelectItem>
                        <SelectItem value="5_to_10">5-10 years</SelectItem>
                        <SelectItem value="more_than_10">More than 10 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Key Skills</Label>
                    <Textarea
                      id="skills"
                      name="skills"
                      placeholder="List your relevant skills (e.g., Photoshop, JavaScript, AutoCAD)"
                      value={formData.skills}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <RadioGroup
                      id="availability"
                      value={formData.availability}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          availability: value
                        });
                      }}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full_time" id="full_time" />
                        <Label htmlFor="full_time">Full-time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="part_time" id="part_time" />
                        <Label htmlFor="part_time">Part-time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="freelance" id="freelance" />
                        <Label htmlFor="freelance">Freelance/Project-based</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about yourself and why you're interested in working with us"
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          agreeToTerms: checked
                        });
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="agreeToTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the terms and policies
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Payment will be processed after completing 3 projects (1 project for large assignments).
                        Payments are project-based, not monthly.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Available Positions</CardTitle>
              <CardDescription>
                Explore the various roles we're currently hiring for
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="content_media">
                  <AccordionTrigger>Content & Media Specialists</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">Document Processor</h4>
                      <p className="text-sm text-gray-600">Handles Word, Excel, and PowerPoint tasks.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Format and edit documents in Word</li>
                          <li>Create and manage spreadsheets in Excel</li>
                          <li>Design presentations in PowerPoint</li>
                          <li>Ensure quality and accuracy of content</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">Graphic Designer</h4>
                      <p className="text-sm text-gray-600">Edits photos and creates design elements.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Edit and enhance photos</li>
                          <li>Create graphics for various platforms</li>
                          <li>Design visual elements for websites and apps</li>
                          <li>Maintain consistent brand identity</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">Video Editor</h4>
                      <p className="text-sm text-gray-600">Edits short and long-form videos.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Edit and produce videos of various lengths</li>
                          <li>Create engaging YouTube shorts</li>
                          <li>Add effects, transitions, and sound</li>
                          <li>Optimize videos for different platforms</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="design_3d">
                  <AccordionTrigger>3D & CAD Designers</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">3D Modeler</h4>
                      <p className="text-sm text-gray-600">Creates 3D objects and circuits.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Model 3D objects for various applications</li>
                          <li>Design 3D circuit layouts</li>
                          <li>Create realistic textures and materials</li>
                          <li>Optimize 3D models for performance</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">AutoCAD Designer</h4>
                      <p className="text-sm text-gray-600">Works on 2D and 3D AutoCAD projects.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Create 2D technical drawings</li>
                          <li>Develop 3D models and designs</li>
                          <li>Ensure accuracy and compliance with standards</li>
                          <li>Handle projects of varying complexity</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="web_development">
                  <AccordionTrigger>Web Development Team</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">Web Designer (HTML & CSS)</h4>
                      <p className="text-sm text-gray-600">Designs websites with front-end technologies.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Create responsive website layouts</li>
                          <li>Write clean HTML and CSS code</li>
                          <li>Ensure cross-browser compatibility</li>
                          <li>Optimize sites for performance and usability</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">JavaScript Developer</h4>
                      <p className="text-sm text-gray-600">Develops website interactivity and widgets.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Write JavaScript functions and features</li>
                          <li>Develop interactive website components</li>
                          <li>Create custom widgets and tools</li>
                          <li>Debug and optimize JavaScript code</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">Backend Developer</h4>
                      <p className="text-sm text-gray-600">Manages website hosting, databases, and automation.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Set up and manage website hosting</li>
                          <li>Design and maintain databases</li>
                          <li>Implement server-side logic</li>
                          <li>Create automation systems and integrations</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="automation">
                  <AccordionTrigger>Automation & Bot Developers</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2 p-4 rounded-lg border">
                      <h4 className="font-bold">Bot Developer</h4>
                      <p className="text-sm text-gray-600">Builds WhatsApp, Instagram, and Discord bots.</p>
                      <div className="text-sm mt-2">
                        <span className="font-semibold">Key responsibilities:</span>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Design and develop chatbots for various platforms</li>
                          <li>Implement bot logic and functionality</li>
                          <li>Integrate bots with existing systems</li>
                          <li>Maintain and update bots as needed</li>
                          <li>Ensure security and reliability</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            
            <CardFooter>
              <Button onClick={() => document.querySelector('[data-value="apply"]').click()} className="w-full">
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WorkWithUs;
