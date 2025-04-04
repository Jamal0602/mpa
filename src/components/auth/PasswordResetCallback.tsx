
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, CheckCircle, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password-input";

export function PasswordResetCallback() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
  
  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword;
  
  // Overall password strength
  const passwordStrength = [
    hasMinLength,
    hasUpperCase, 
    hasLowerCase,
    hasNumber,
    hasSpecialChar
  ].filter(Boolean).length;
  
  const isValidPassword = 
    hasMinLength && 
    hasUpperCase && 
    hasLowerCase && 
    hasNumber && 
    hasSpecialChar && 
    passwordsMatch;
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError("");
    
    if (!passwordsMatch) {
      setValidationError("Passwords don't match");
      return;
    }
    
    if (!isValidPassword) {
      setValidationError("Password doesn't meet the requirements");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      toast.success("Password updated successfully");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error: any) {
      toast.error("Failed to update password", {
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  }
  
  // Check if we're on the right page with the right hash
  useEffect(() => {
    const checkHashParams = async () => {
      // If no hash parameters, redirect to password reset request page
      if (!window.location.hash) {
        navigate("/auth/reset");
        return;
      }
      
      // Verify that the user is in a password reset flow
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error("Invalid or expired reset link", {
          description: "Please request a new password reset link",
        });
        navigate("/auth/reset");
      }
    };
    
    checkHashParams();
  }, [navigate]);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a new password</CardTitle>
        <CardDescription>
          Your password must be strong and secure.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-center text-lg font-medium">Password updated</h3>
            <p className="text-center text-sm text-muted-foreground">
              You'll be redirected to the login page in a moment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>New Password</span>
                  </div>
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              {/* Password strength meter */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level}
                      className={`h-1.5 flex-1 rounded-full ${
                        passwordStrength >= level 
                          ? [
                              "bg-red-500",
                              "bg-orange-500",
                              "bg-yellow-500",
                              "bg-lime-500",
                              "bg-green-500",
                            ][passwordStrength - 1]
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                
                <ul className="grid gap-1 text-xs">
                  <li className={`flex items-center gap-1 ${hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                    <div className={`h-1 w-1 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-1 ${hasUpperCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                    <div className={`h-1 w-1 rounded-full ${hasUpperCase ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    Uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center gap-1 ${hasLowerCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                    <div className={`h-1 w-1 rounded-full ${hasLowerCase ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    Lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center gap-1 ${hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                    <div className={`h-1 w-1 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    Number (0-9)
                  </li>
                  <li className={`flex items-center gap-1 ${hasSpecialChar ? 'text-green-500' : 'text-muted-foreground'}`}>
                    <div className={`h-1 w-1 rounded-full ${hasSpecialChar ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    Special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>
              
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
              
              <Button type="submit" disabled={loading || !isValidPassword}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default PasswordResetCallback;
