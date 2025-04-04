
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MailCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get the current URL to use as a redirect
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/reset-callback`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        throw error;
      }
      
      setSubmitted(true);
      toast.success("Password reset email sent", {
        description: "Check your inbox for the reset link",
      });
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <MailCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-center text-lg font-medium">Check your email</h3>
            <p className="text-center text-sm text-muted-foreground">
              We've sent a password reset link to {email}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t p-4">
        <Link to="/auth">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default PasswordResetForm;
