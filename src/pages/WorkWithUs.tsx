
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingPage } from "@/components/ui/loading";
import { FileText, Briefcase, Users, LucideIcon, PanelLeft, Camera, Video, SlidersHorizontal, Code, Bot, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LocationData {
  country: string;
  state: string;
  district: string;
  place: string;
}

interface JobCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  positions: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    paymentTerms: string;
  }[];
}

const WorkWithUs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    phone: "",
    portfolio: "",
    experience: "",
    jobCategory: "",
    position: "",
    agreedToTerms: false,
  });
  const [locationData, setLocationData] = useState<LocationData>({
    country: "",
    state: "",
    district: "",
    place: "",
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("country, state, district, place, full_name")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setLocationData({
            country: data.country || "",
            state: data.state || "",
            district: data.district || "",
            place: data.place || "",
          });
          setFormData(prev => ({
            ...prev,
            fullName: data.full_name || "",
            email: user.email || "",
          }));
        }
      } catch (error: any) {
        toast.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const jobCategories: JobCategory[] = [
    {
      id: "content-media",
      title: "Content & Media Specialists",
      icon: Camera,
      positions: [
        {
          id: "document-processor",
          title: "Document Processor",
          description: "Handle Word, Excel, and PowerPoint tasks for our clients.",
          requirements: ["Proficiency in MS Office Suite", "Attention to detail", "Good time management"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        },
        {
          id: "graphic-designer",
          title: "Graphic Designer",
          description: "Edit photos and create design elements for various projects.",
          requirements: ["Experience with Photoshop/Illustrator", "Portfolio of previous work", "Understanding of design principles"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        },
        {
          id: "video-editor",
          title: "Video Editor",
          description: "Edit short and long-form videos for clients and platforms.",
          requirements: ["Proficiency in video editing software", "Understanding of narrative structure", "Experience with audio mixing"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        }
      ]
    },
    {
      id: "3d-cad",
      title: "3D & CAD Designers",
      icon: SlidersHorizontal,
      positions: [
        {
          id: "3d-modeler",
          title: "3D Modeler",
          description: "Create 3D objects and circuits for client projects.",
          requirements: ["Experience with 3D modeling software", "Understanding of geometric principles", "Attention to detail"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        },
        {
          id: "autocad-designer",
          title: "AutoCAD Designer",
          description: "Work on 2D and 3D AutoCAD projects for clients.",
          requirements: ["Proficiency in AutoCAD", "Technical drawing skills", "Understanding of design standards"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        }
      ]
    },
    {
      id: "web-development",
      title: "Web Development Team",
      icon: Code,
      positions: [
        {
          id: "web-designer",
          title: "Web Designer (HTML & CSS)",
          description: "Design websites with front-end technologies.",
          requirements: ["HTML/CSS proficiency", "Responsive design skills", "Understanding of UI/UX principles"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        },
        {
          id: "js-developer",
          title: "JavaScript Developer",
          description: "Develop website interactivity and widgets.",
          requirements: ["JavaScript expertise", "Experience with modern frameworks", "Problem-solving skills"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        },
        {
          id: "backend-developer",
          title: "Backend Developer",
          description: "Manage website hosting, databases, and automation.",
          requirements: ["Backend development experience", "Database management skills", "API development knowledge"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        }
      ]
    },
    {
      id: "automation-bots",
      title: "Automation & Bot Developers",
      icon: Bot,
      positions: [
        {
          id: "bot-developer",
          title: "Bot Developer",
          description: "Build WhatsApp, Instagram, and Discord bots for clients.",
          requirements: ["Programming experience", "API integration skills", "Understanding of bot frameworks"],
          paymentTerms: "Payment after completing 3 projects. For large projects, payment after each project.",
        }
      ]
    }
  ];

  const selectedCategory = jobCategories.find(cat => cat.id === formData.jobCategory);
  const positions = selectedCategory?.positions || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    
    if (!user) {
      toast.error("Please login to apply");
      navigate("/auth");
      return;
    }
    
    // Here you would submit the application to your database
    toast.success("Your application has been submitted successfully!");
    
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      age: "",
      phone: "",
      portfolio: "",
      experience: "",
      jobCategory: "",
      position: "",
      agreedToTerms: false,
    });
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Join Our Team</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Become part of our growing network of professionals and work on exciting projects using your skills.
            </p>
          </div>
          
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="positions">Available Positions</TabsTrigger>
              <TabsTrigger value="apply">Apply Now</TabsTrigger>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="positions" className="space-y-6">
              {jobCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                    <CardDescription>Positions available in this category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.positions.map((position) => (
                        <AccordionItem key={position.id} value={position.id}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              <span>{position.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <p>{position.description}</p>
                            
                            <div>
                              <h4 className="font-medium mb-2">Requirements:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {position.requirements.map((req, index) => (
                                  <li key={index} className="text-muted-foreground">{req}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Payment Terms:</h4>
                              <p className="text-muted-foreground">{position.paymentTerms}</p>
                            </div>
                            
                            <Button 
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  jobCategory: category.id,
                                  position: position.id
                                }));
                                document.querySelector('[data-value="apply"]')?.click();
                              }}
                            >
                              Apply for this Position
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="apply">
              <Card>
                <CardHeader>
                  <CardTitle>Application Form</CardTitle>
                  <CardDescription>
                    Please fill out the form below to apply for a position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          value={formData.fullName} 
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input 
                          id="age" 
                          type="number" 
                          value={formData.age} 
                          onChange={e => setFormData({...formData, age: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Location Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input 
                            id="country" 
                            value={locationData.country} 
                            onChange={e => setLocationData({...locationData, country: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input 
                            id="state" 
                            value={locationData.state} 
                            onChange={e => setLocationData({...locationData, state: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="district">District</Label>
                          <Input 
                            id="district" 
                            value={locationData.district} 
                            onChange={e => setLocationData({...locationData, district: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="place">Place</Label>
                          <Input 
                            id="place" 
                            value={locationData.place} 
                            onChange={e => setLocationData({...locationData, place: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio Link (optional)</Label>
                      <Input 
                        id="portfolio" 
                        placeholder="https://yourportfolio.com" 
                        value={formData.portfolio} 
                        onChange={e => setFormData({...formData, portfolio: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Relevant Experience</Label>
                      <Textarea 
                        id="experience" 
                        placeholder="Tell us about your experience related to the position" 
                        className="min-h-[120px]"
                        value={formData.experience} 
                        onChange={e => setFormData({...formData, experience: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jobCategory">Job Category</Label>
                        <Select 
                          value={formData.jobCategory} 
                          onValueChange={value => setFormData({...formData, jobCategory: value, position: ""})}
                          required
                        >
                          <SelectTrigger id="jobCategory">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <category.icon className="h-4 w-4" />
                                  <span>{category.title}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Select 
                          value={formData.position} 
                          onValueChange={value => setFormData({...formData, position: value})}
                          disabled={!formData.jobCategory}
                          required
                        >
                          <SelectTrigger id="position">
                            <SelectValue placeholder="Select a position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map(position => (
                              <SelectItem key={position.id} value={position.id}>
                                {position.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, agreedToTerms: checked as boolean})
                        }
                        required
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the terms and conditions
                        </label>
                        <p className="text-sm text-muted-foreground">
                          By checking this box, you agree to our{" "}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-sm"
                            onClick={() => document.querySelector('[data-value="terms"]')?.click()}
                          >
                            terms and payment policies
                          </Button>.
                        </p>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSubmit}>
                    Submit Application
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Payment Policies</CardTitle>
                  <CardDescription>
                    Please read our terms and payment policies carefully
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Payment Terms</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Payments are project-based, not monthly.</li>
                      <li>For standard projects, payment will be processed after completing 3 projects.</li>
                      <li>For large projects, payment will be processed after each project completion.</li>
                      <li>Payment rates are based on the service pricing as shown on our Help page.</li>
                      <li>All payments will be made through bank transfer or UPI.</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Working Terms</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>You are responsible for maintaining the quality of work.</li>
                      <li>Project deadlines must be adhered to strictly.</li>
                      <li>You may work remotely and on your own schedule.</li>
                      <li>Communication must be prompt and professional.</li>
                      <li>All work produced is the property of our company and clients.</li>
                      <li>Confidentiality of client information must be maintained.</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Termination</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Either party may terminate the working relationship with a 7-day notice.</li>
                      <li>Payment for completed work will be processed as per the payment terms.</li>
                      <li>Repeated failure to meet deadlines or maintain quality may result in immediate termination.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WorkWithUs;
