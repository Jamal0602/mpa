
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  age: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 18, {
    message: "You must be at least 18 years old.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  position: z.string({
    required_error: "Please select a position.",
  }),
  experience: z.string().min(10, {
    message: "Experience details must be at least 10 characters.",
  }),
  portfolio: z.string().url({
    message: "Please enter a valid URL for your portfolio.",
  }).optional().or(z.literal('')),
  message: z.string().min(20, {
    message: "Your message must be at least 20 characters.",
  }),
});

const positions = [
  { value: "document_processor", label: "Document Processor" },
  { value: "graphic_designer", label: "Graphic Designer" },
  { value: "video_editor", label: "Video Editor" },
  { value: "3d_modeler", label: "3D Modeler" },
  { value: "autocad_designer", label: "AutoCAD Designer" },
  { value: "web_designer", label: "Web Designer (HTML & CSS)" },
  { value: "javascript_developer", label: "JavaScript Developer" },
  { value: "backend_developer", label: "Backend Developer" },
  { value: "bot_developer", label: "Bot Developer" },
];

const WorkWithUs = () => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      age: "",
      location: "",
      position: "",
      experience: "",
      portfolio: "",
      message: "",
    },
  });

  // Fetch user profile for auto-filling location data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.session.user.id)
          .single();

        if (!error && data) {
          setUserProfile(data);
          
          // Auto-fill location based on profile data
          let location = "";
          if (data.place) location += data.place;
          if (data.district) {
            if (location) location += ", ";
            location += data.district;
          }
          if (data.state) {
            if (location) location += ", ";
            location += data.state;
          }
          if (data.country) {
            if (location) location += ", ";
            location += data.country;
          }
          
          form.setValue("location", location);
          form.setValue("fullName", data.full_name || "");
          form.setValue("email", session.session.user.email || "");
        }
      }
    };

    fetchUserProfile();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to apply");
        return;
      }
      
      // Store application in database (you'll need to create this table)
      const { error } = await supabase.from("job_applications").insert({
        user_id: session.session.user.id,
        full_name: values.fullName,
        email: values.email,
        age: parseInt(values.age),
        location: values.location,
        position: values.position,
        experience: values.experience,
        portfolio: values.portfolio,
        message: values.message,
        status: "pending",
      });
      
      if (error) throw error;
      
      // Create a notification for the user about their application
      await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: "Application Received",
          message: `Thank you for applying to work with us as a ${positions.find(p => p.value === values.position)?.label}. We'll review your application and get back to you soon.`,
          type: "success",
        });
      
      toast.success("Application submitted successfully!");
      form.reset();
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Work With Us</h1>
          <p className="text-muted-foreground mt-2">
            Join our team of skilled professionals and work on exciting projects
          </p>
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Positions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium">Content & Media Specialists</h3>
                <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
                  <li>Document Processor – Handles Word, Excel, and PowerPoint tasks</li>
                  <li>Graphic Designer – Edits photos and creates design elements</li>
                  <li>Video Editor – Edits short and long-form videos</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium">3D & CAD Designers</h3>
                <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
                  <li>3D Modeler – Creates 3D objects and circuits</li>
                  <li>AutoCAD Designer – Works on 2D and 3D AutoCAD projects</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium">Web Development Team</h3>
                <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
                  <li>Web Designer (HTML & CSS) – Designs websites with front-end technologies</li>
                  <li>JavaScript Developer – Develops website interactivity and widgets</li>
                  <li>Backend Developer – Manages website hosting, databases, and automation</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium">Automation & Bot Developers</h3>
                <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
                  <li>Bot Developer – Builds WhatsApp, Instagram, and Discord bots</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h3 className="text-lg font-medium">Payment Terms</h3>
              <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
                <li>Payment released after completion of 3 projects</li>
                <li>For larger projects, payment after 1 project</li>
                <li>Payment tied to project completion, not monthly</li>
                <li>UPI ID for payments: ja.jamalasraf@fam</li>
              </ul>
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
                <CardDescription>
                  Fill out the form below to apply for a position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" min="18" placeholder="Your age" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Your location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positions.map((position) => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your relevant experience" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="portfolio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Link to your portfolio" {...field} />
                          </FormControl>
                          <FormDescription>
                            Share a link to your portfolio or previous work
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information you'd like to share" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkWithUs;
