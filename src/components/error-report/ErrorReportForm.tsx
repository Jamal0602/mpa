
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const errorReportSchema = z.object({
  errorType: z.string().min(1, "Error type is required"),
  transactionId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contactEmail: z.string().email("Invalid email address"),
});

type ErrorReportFormData = z.infer<typeof errorReportSchema>;

interface ErrorReportFormProps {
  userId: string;
  userEmail: string;
}

export const ErrorReportForm = ({ userId, userEmail }: ErrorReportFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ErrorReportFormData>({
    errorType: "",
    transactionId: "",
    description: "",
    contactEmail: userEmail || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ErrorReportFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field when user changes it
    if (errors[name as keyof ErrorReportFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, errorType: value }));
    
    // Clear the error for this field when user changes it
    if (errors.errorType) {
      setErrors(prev => ({ ...prev, errorType: undefined }));
    }
  };

  const validateForm = () => {
    try {
      errorReportSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ErrorReportFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ErrorReportFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const openGitHubIssue = () => {
    const issueTitle = `[${formData.errorType}] Issue Report`;
    const issueBody = `
## Error Details
- **Type**: ${formData.errorType}
- **Transaction ID**: ${formData.transactionId || 'N/A'}
- **Contact Email**: ${formData.contactEmail}

## Description
${formData.description}

---
*This issue was submitted via the MPA Error Report System*
    `;
    
    const encodedTitle = encodeURIComponent(issueTitle);
    const encodedBody = encodeURIComponent(issueBody);
    
    window.open(`https://github.com/Jamal0602/MPA/issues/new?title=${encodedTitle}&body=${encodedBody}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (!userId) {
        throw new Error("You must be logged in to report an error");
      }
      
      const { error } = await supabase
        .from('error_reports')
        .insert({
          user_id: userId,
          error_type: formData.errorType,
          transaction_id: formData.transactionId || null,
          description: formData.description,
          contact_email: formData.contactEmail,
          status: 'pending'
        });
      
      if (error) throw error;
      
      // Open GitHub issue page
      openGitHubIssue();
      
      toast.success("Error report submitted successfully");
      navigate("/"); // Redirect to home page after submission
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error(error.message || "Failed to submit error report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-lg p-6">
      <div className="space-y-2">
        <Label htmlFor="errorType">Type of Error <span className="text-destructive">*</span></Label>
        <Select value={formData.errorType} onValueChange={handleSelectChange}>
          <SelectTrigger id="errorType">
            <SelectValue placeholder="Select error type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="payment">Payment Issue</SelectItem>
            <SelectItem value="technical">Technical Problem</SelectItem>
            <SelectItem value="content">Content Error</SelectItem>
            <SelectItem value="account">Account Problem</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.errorType && (
          <p className="text-sm text-destructive">{errors.errorType}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transactionId">
          Transaction ID (if applicable)
        </Label>
        <Input 
          id="transactionId"
          name="transactionId"
          value={formData.transactionId}
          onChange={handleChange}
          placeholder="e.g., tx_1234567890"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">
          Detailed Description <span className="text-destructive">*</span>
        </Label>
        <Textarea 
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Please describe the error in detail, including what you were doing when it occurred."
          rows={5}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactEmail">
          Contact Email <span className="text-destructive">*</span>
        </Label>
        <Input 
          id="contactEmail"
          name="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={handleChange}
          placeholder="email@example.com"
        />
        {errors.contactEmail && (
          <p className="text-sm text-destructive">{errors.contactEmail}</p>
        )}
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => navigate("/")}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </form>
  );
};
