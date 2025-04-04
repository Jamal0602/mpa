
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Paperclip, FileText, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Form schema
const formSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  email: z.string().email('Invalid email address'),
  experience: z.string().min(1, 'Experience is required'),
  phone: z.string().optional(),
  cover_letter: z.string().min(10, 'Cover letter must be at least 10 characters'),
  skills: z.string().min(1, 'Skills are required'),
});

type FormValues = z.infer<typeof formSchema>;

const availablePositions = [
  'Frontend Developer',
  'Backend Developer',
  'UI/UX Designer',
  'Project Manager',
  'Content Writer',
  'Marketing Specialist',
  'Customer Support',
  'Data Analyst',
  'DevOps Engineer',
  'Quality Assurance',
];

export function EnhancedJobApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: '',
      email: user?.email || '',
      experience: '',
      phone: '',
      cover_letter: '',
      skills: '',
    },
  });

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Resume file must be less than 5MB');
        return;
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and Word documents are accepted');
        return;
      }
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile || !user) return '';

    setUploadingResume(true);
    try {
      const fileExt = resumeFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job_applications')
        .upload(filePath, resumeFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('job_applications')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      toast.error(`Failed to upload resume: ${error.message}`);
      return '';
    } finally {
      setUploadingResume(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to apply');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload resume if available
      let resumeUrl = '';
      if (resumeFile) {
        resumeUrl = await uploadResume();
        if (!resumeUrl) {
          setIsSubmitting(false);
          return; // Exit if resume upload failed
        }
      }

      // Create job application
      const { error } = await supabase.from('job_applications').insert({
        user_id: user.id,
        position: values.position,
        email: values.email,
        experience: values.experience,
        phone: values.phone || null,
        cover_letter: values.cover_letter,
        resume_url: resumeUrl,
        skills: values.skills.split(',').map(skill => skill.trim()),
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Application submitted successfully! We will contact you soon.');
      form.reset();
      setResumeFile(null);

      // Create a notification for the user
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Job Application Received',
        message: `Thank you for applying for the ${values.position} position. We will review your application shortly.`,
        type: 'job_application',
        is_read: false,
      });

    } catch (error: any) {
      toast.error(`Error submitting application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 bg-card rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Job Application</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Position */}
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
                    {availablePositions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Experience */}
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-1 years">0-1 years</SelectItem>
                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="5-10 years">5-10 years</SelectItem>
                    <SelectItem value="10+ years">10+ years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Skills */}
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills (comma separated)</FormLabel>
                <FormControl>
                  <Input placeholder="React, TypeScript, Node.js, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cover Letter */}
          <FormField
            control={form.control}
            name="cover_letter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about yourself and why you're interested in this position..." 
                    className="min-h-[150px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Resume Upload */}
          <div className="space-y-2">
            <FormLabel>Resume</FormLabel>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('resume-upload')?.click()}
                className="relative"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                {uploadingResume ? "Uploading..." : "Upload Resume"}
                <Input
                  id="resume-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                />
              </Button>
              {resumeFile && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {resumeFile.name}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your resume in PDF or Word format (max 5MB)
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || uploadingResume}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
