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
import { Loader2 } from "lucide-react";

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
});

type ErrorReportFormValues = z.infer<typeof errorReportSchema>;

interface ErrorReportFormProps {
  onSuccess?: () => void;
}

export const ErrorReportForm = ({ onSuccess }: ErrorReportFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ErrorReportFormValues>({
    resolver: zodResolver(errorReportSchema),
    defaultValues: {
      error_type: "",
      transaction_id: "",
      description: "",
      contact_email: user?.email || "",
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
        toast.error("You've reached the daily limit of 5 error reports");
        return;
      }

      // Submit the report
      const { error } = await supabase.from("error_reports").insert({
        user_id: user.id,
        error_type: data.error_type,
        transaction_id: data.transaction_id || null,
        description: data.description,
        contact_email: data.contact_email,
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

  return (
    <div className="bg-card border rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the category that best describes the error you encountered
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
