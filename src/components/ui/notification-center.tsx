
import * as React from "react";
import { BellRing, Check, Info, AlertTriangle, AlertCircle, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@/components/ui/notification";
import { useNotifications } from "@/contexts/NotificationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();
  const [open, setOpen] = React.useState(false);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };
  
  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  // Group notifications by type for better organization
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, typeof notifications> = {
      unread: notifications.filter(n => !n.is_read),
      read: notifications.filter(n => n.is_read),
    };
    return groups;
  }, [notifications]);

  return (
    <div className="w-full">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <BellRing className="h-4 w-4" />
        Notifications
        {unreadCount > 0 && (
          <Badge className="ml-1" variant="secondary">
            {unreadCount} unread
          </Badge>
        )}
      </h3>
      
      {loading ? (
        <div className="flex items-center justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <BellRing className="h-10 w-10 text-muted-foreground/60" />
          <h3 className="mt-2 text-sm font-medium">No notifications</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            You're all caught up! We'll notify you when something new arrives.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {unreadCount > 0 && (
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark all as read
              </Button>
              
              <Button
                variant="ghost" 
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={handleDeleteAll}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear all
              </Button>
            </div>
          )}
          
          <ScrollArea className="h-[250px] pr-4">
            {groupedNotifications.unread.length > 0 && (
              <>
                {groupedNotifications.unread.map((notification) => (
                  <Notification
                    key={notification.id}
                    title={notification.title}
                    message={notification.message}
                    type={notification.type}
                    read={notification.is_read}
                    time={notification.created_at}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onDelete={() => handleDelete(notification.id)}
                  />
                ))}
              </>
            )}
            
            {groupedNotifications.read.length > 0 && (
              <>
                {groupedNotifications.unread.length > 0 && groupedNotifications.read.length > 0 && (
                  <div className="flex items-center gap-2 my-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">Read</span>
                    <Separator className="flex-1" />
                  </div>
                )}
                {groupedNotifications.read.map((notification) => (
                  <Notification
                    key={notification.id}
                    title={notification.title}
                    message={notification.message}
                    type={notification.type}
                    read={notification.is_read}
                    time={notification.created_at}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onDelete={() => handleDelete(notification.id)}
                  />
                ))}
              </>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
