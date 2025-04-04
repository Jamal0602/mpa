
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthMeter?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthMeter = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);

    const calculateStrength = (password: string): number => {
      if (!password) return 0;
      
      let score = 0;
      
      // Length check
      if (password.length > 6) score += 1;
      if (password.length > 10) score += 1;
      
      // Complexity checks
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;
      
      return Math.min(score, 4); // 0-4 scale
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrengthMeter) {
        setStrength(calculateStrength(e.target.value));
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const strengthColors = [
      "bg-red-500", // Very weak
      "bg-orange-500", // Weak
      "bg-yellow-500", // Medium
      "bg-blue-500", // Strong
      "bg-green-500", // Very strong
    ];

    const strengthLabels = [
      "Very weak",
      "Weak",
      "Medium",
      "Strong",
      "Very strong"
    ];

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={cn("pr-10", className)}
            ref={ref}
            onChange={handleChange}
            {...props}
            aria-invalid={props["aria-invalid"]}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        
        {showStrengthMeter && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className={cn(
                    "h-full flex-1 rounded-sm transition-colors", 
                    index < strength ? strengthColors[strength] : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            {strength > 0 && (
              <p className="text-xs text-muted-foreground">
                {strengthLabels[strength-1]}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
