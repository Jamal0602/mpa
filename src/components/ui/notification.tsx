
import * as React from "react";
import { 
  Bell, 
  Check, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  MoreHorizontal 
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const notificationVariants = cva(
  "relative flex w-full cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50",
  {
    variants: {
      type: {
        info: "border-blue-200 bg-blue-50 dark:border-blue-950 dark:bg-blue-950/50",
        success: "border-green-200 bg-green-50 dark:border-green-950 dark:bg-green-950/50",
        warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-950 dark:bg-yellow-950/50",
        error: "border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/50",
        default: "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950",
      },
      read: {
        true: "opacity-70",
        false: "",
      },
    },
    defaultVariants: {
      type: "default",
      read: false,
    },
  }
);

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title: string;
  message: string;
  time: Date | string;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, type, read, title, message, time, onMarkAsRead, onDelete, ...props }, ref) => {
    const formattedTime = typeof time === 'string' 
      ? formatDistanceToNow(new Date(time), { addSuffix: true }) 
      : formatDistanceToNow(time, { addSuffix: true });
      
    const getIcon = () => {
      switch (type) {
        case "info":
          return <Info className="h-5 w-5 text-blue-500" />;
        case "success":
          return <Check className="h-5 w-5 text-green-500" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        case "error":
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        default:
          return <Bell className="h-5 w-5 text-gray-500" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ type, read, className }))}
        {...props}
      >
        {!read && (
          <Badge className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 p-0" />
        )}
        
        <div className="mt-1 flex-shrink-0">{getIcon()}</div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!read && onMarkAsRead && (
                  <DropdownMenuItem onClick={onMarkAsRead}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-500">
                    <X className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
          <time className="text-xs text-muted-foreground">{formattedTime}</time>
        </div>
      </div>
    );
  }
);

Notification.displayName = "Notification";

export { Notification };
