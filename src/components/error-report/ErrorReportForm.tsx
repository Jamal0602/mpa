
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Loader2, Upload, AlertTriangle } from "lucide-react";
import { CustomBadge } from "@/components/ui/custom-badge";

const errorReportSchema = z.object({
  error_type: z.string({
    required_error: "Please select an error type",
  }),
  transaction_id: z.string().optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  contact_email: z.string().email("Please enter a valid email address"),
  priority: z.string().optional(),
  category: z.string().optional(),
  platform: z.string().optional(),
});

type ErrorReportFormValues = z.infer<typeof errorReportSchema>;

interface ErrorReportFormProps {
  onSuccess?: () => void;
}

export const ErrorReportForm = ({ onSuccess }: ErrorReportFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reachedLimit, setReachedLimit] = useState(false);

  const form = useForm<ErrorReportFormValues>({
    resolver: zodResolver(errorReportSchema),
    defaultValues: {
      error_type: "",
      transaction_id: "",
      description: "",
      contact_email: user?.email || "",
      priority: "medium",
      category: "general",
      platform: "web",
    },
  });

  const onSubmit = async (data: ErrorReportFormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit a report");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user has reached daily limit (5 reports per day)
      const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      const { data: existingReports, error: countError } = await supabase
        .from("error_reports")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);

      if (countError) throw countError;

      if (existingReports && existingReports.length >= 5) {
        setReachedLimit(true);
        toast.error("You've reached the daily limit of 5 error reports");
        return;
      }

      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
      };

      // Submit the report
      const { error } = await supabase.from("error_reports").insert({
        user_id: user.id,
        error_type: data.error_type,
        transaction_id: data.transaction_id || null,
        description: data.description,
        contact_email: data.contact_email,
        priority: data.priority,
        category: data.category,
        platform: data.platform,
        browser_info: browserInfo,
      });

      if (error) throw error;

      toast.success("Error report submitted successfully");
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reachedLimit) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-medium">Daily Report Limit Reached</h3>
          <p className="text-muted-foreground">
            You've submitted the maximum number of 5 reports for today. Please try again tomorrow or contact support directly.
          </p>
          <CustomBadge variant="warning" className="mt-2">5/5 Reports Used</CustomBadge>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="error_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of error" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="login_issue">Login Issue</SelectItem>
                      <SelectItem value="payment_problem">Payment Problem</SelectItem>
                      <SelectItem value="feature_not_working">Feature Not Working</SelectItem>
                      <SelectItem value="display_error">Display Error</SelectItem>
                      <SelectItem value="performance_issue">Performance Issue</SelectItem>
                      <SelectItem value="security_concern">Security Concern</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="web">Web Browser</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                      <SelectItem value="desktop">Desktop App</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="transaction_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter transaction ID if applicable"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  If this is related to a specific transaction, please provide the ID
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe the error in detail. Include what you were doing when it occurred."
                    className="min-h-[120px]"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Be as specific as possible. Include steps to reproduce if applicable.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  We'll use this to contact you if we need more information
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end items-center gap-4">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{5 - (form.formState.isSubmitSuccessful ? 1 : 0)}/5</span> reports remaining today
            </div>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
