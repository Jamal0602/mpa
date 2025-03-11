
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Github, Apple, Mail, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  // Redirect URI should point to your auth callback page
  const redirectUri = `${window.location.origin}/auth/callback`;

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one symbol";
    return "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!isLogin) {
      setPasswordError(validatePassword(newPassword));
      
      if (confirmPassword && confirmPassword !== newPassword) {
        setFormError("Passwords do not match");
      } else {
        setFormError("");
      }
    }
  };
  
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmValue = e.target.value;
    setConfirmPassword(confirmValue);
    
    if (confirmValue !== password) {
      setFormError("Passwords do not match");
    } else {
      setFormError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!isLogin && password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    
    if (!isLogin && passwordError) {
      toast.error("Please fix password requirements");
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success("Successfully signed in!");
        navigate("/");
      } else {
        // Format the email to extract a username for the MPA ID
        const username = email.split('@')[0];
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username,
              full_name: username
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please sign in instead.");
          setIsLogin(true);
        } else {
          toast.success("Registration successful! Please check your email to confirm your account.");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      const errorMessage = error.message || "An error occurred during authentication";
      
      // Handle common auth errors with more user-friendly messages
      if (errorMessage.includes("Invalid login credentials")) {
        setFormError("Invalid email or password. Please try again.");
      } else if (errorMessage.includes("Email not confirmed")) {
        setFormError("Please confirm your email before signing in.");
      } else if (errorMessage.includes("already registered")) {
        setFormError("This email is already registered. Please sign in instead.");
        setIsLogin(true);
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'apple') => {
    try {
      setOAuthLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUri,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent'
          } : undefined
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast.error(`Error signing in with ${provider}: ${error.message}`);
      setOAuthLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-b from-background to-background/80">
      <motion.div 
        className="w-full max-w-sm space-y-6 bg-card p-6 rounded-lg shadow-lg border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Enter your credentials to sign in"
              : "Enter your details to create an account"}
          </p>
        </div>

        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button 
            variant="outline" 
            type="button" 
            className="w-full relative overflow-hidden"
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading || !!oauthLoading}
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
            {oauthLoading === 'google' && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10 }}
              />
            )}
          </Button>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full relative overflow-hidden" 
            onClick={() => handleOAuthSignIn('github')}
            disabled={loading || !!oauthLoading}
          >
            {oauthLoading === 'github' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            Continue with GitHub
            {oauthLoading === 'github' && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10 }}
              />
            )}
          </Button>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full relative overflow-hidden" 
            onClick={() => handleOAuthSignIn('apple')}
            disabled={loading || !!oauthLoading}
          >
            {oauthLoading === 'apple' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Apple className="mr-2 h-4 w-4" />
            )}
            Continue with Apple
            {oauthLoading === 'apple' && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-primary"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10 }}
              />
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!oauthLoading}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading || !!oauthLoading}
                  required
                  className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/25"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={loading || !!oauthLoading}
                    required
                    className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>
            )}
            
            {!isLogin && (
              <motion.div 
                className="text-xs text-muted-foreground space-y-1 mt-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <p>Password must contain:</p>
                <ul className="list-disc pl-4">
                  <motion.li 
                    className={`${password.length >= 8 ? "text-green-500" : ""} transition-colors duration-300`}
                    animate={{ x: password.length >= 8 ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    At least 8 characters
                  </motion.li>
                  <motion.li 
                    className={`${/[A-Z]/.test(password) ? "text-green-500" : ""} transition-colors duration-300`}
                    animate={{ x: /[A-Z]/.test(password) ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    One uppercase letter
                  </motion.li>
                  <motion.li 
                    className={`${/[a-z]/.test(password) ? "text-green-500" : ""} transition-colors duration-300`}
                    animate={{ x: /[a-z]/.test(password) ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    One lowercase letter
                  </motion.li>
                  <motion.li 
                    className={`${/[0-9]/.test(password) ? "text-green-500" : ""} transition-colors duration-300`}
                    animate={{ x: /[0-9]/.test(password) ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    One number
                  </motion.li>
                  <motion.li 
                    className={`${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : ""} transition-colors duration-300`}
                    animate={{ x: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    One special character
                  </motion.li>
                </ul>
              </motion.div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !!oauthLoading || (!isLogin && (!!passwordError || password !== confirmPassword))}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Sign Up"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-primary hover:underline transition-colors"
            onClick={() => {
              setIsLogin(!isLogin);
              setPasswordError("");
              setFormError("");
              setConfirmPassword("");
            }}
            disabled={loading || !!oauthLoading}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthForm;
