import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { positions } from "./PositionsList";
import { useNavigate } from "react-router-dom";

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

type FormValues = z.infer<typeof formSchema>;

export const JobApplicationForm = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const form = useForm<FormValues>({
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setUserProfile(data);
        
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
      }
      
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        form.setValue("email", session.session.user.email || "");
      }
    };

    fetchUserProfile();
  }, [userId, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (!userId) {
        toast.error("You must be logged in to apply");
        return;
      }
      
      const { error } = await supabase.from("job_applications").insert({
        user_id: userId,
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
      
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: "Application Received",
          message: `Thank you for applying to work with us as a ${positions.find(p => p.value === values.position)?.label}. We'll review your application and get back to you soon.`,
          type: "success",
        });
      
      toast.success("Application submitted successfully!");
      form.reset();
      navigate("/");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};
