
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmitButton
} from "@/components/ui/form";

interface JobApplicationFormProps {
  userId: string;
  position: string;
  onSubmitSuccess?: () => void;
}

const formSchema = z.object({
  position: z.string().min(1, "Position is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
  experience: z.string().optional(),
  skills: z.string().optional(),
});

export const JobApplicationForm = ({ userId, position, onSubmitSuccess }: JobApplicationFormProps) => {
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: position,
      email: "",
      phone: "",
      coverLetter: "",
      experience: "",
      skills: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    try {
      // Check if the bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const resumesBucket = buckets?.find(bucket => bucket.name === 'resumes');
      
      if (!resumesBucket) {
        // Create the bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('resumes', {
          public: false, // Private by default
          allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          throw new Error("Error creating storage bucket: " + bucketError.message);
        }
      }

      // Upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get the URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const resumeUrl = await uploadResume(resumeFile);

      if (!resumeUrl) {
        throw new Error("Failed to upload resume");
      }

      // Submit the job application to the database
      const { error } = await supabase.from('job_applications').insert({
        user_id: userId,
        position: values.position,
        email: values.email,
        phone: values.phone,
        resume_url: resumeUrl,
        cover_letter: values.coverLetter,
        experience: values.experience,
        skills: values.skills ? values.skills.split(',').map(s => s.trim()) : [],
        status: 'pending',
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully!",
      });

      // Reset the form
      form.reset();
      setResumeFile(null);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: `There was an error submitting your application: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
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
                <Input {...field} type="email" placeholder="your@email.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your phone number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel htmlFor="resume">Resume/CV</FormLabel>
          <Input 
            id="resume" 
            type="file" 
            accept=".pdf,.doc,.docx" 
            onChange={handleFileChange} 
            required
          />
          <FormDescription>
            Upload your resume (PDF, DOC, or DOCX format, max 5MB)
          </FormDescription>
          {resumeFile && (
            <p className="text-sm mt-2">Selected file: {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Tell us why you're interested in this position and what makes you a good fit..."
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 3 years" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., JavaScript, React, Node.js" />
              </FormControl>
              <FormDescription>
                Comma-separated list of your key skills
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton
          loading={isUploading}
          loadingText="Submitting Application..."
          className="w-full"
        >
          Submit Application
        </FormSubmitButton>
      </form>
    </Form>
  );
};
