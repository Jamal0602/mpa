
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Using any to work around the type issue until the database types are updated
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false }) as { data: Notification[] | null, error: any };

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Using any to work around the type issue until the database types are updated
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id) as { error: any };

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      // Using any to work around the type issue until the database types are updated
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false) as { error: any };

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Using any to work around the type issue until the database types are updated
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id) as { error: any };

      if (error) throw error;

      // Update local state
      const deleted = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      // Using any to work around the type issue until the database types are updated
      const { error } = await supabase
        .from('notifications')
        .delete()
        .not('id', 'is', null) as { error: any };

      if (error) throw error;

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const refreshNotifications = async () => {
    setLoading(true);
    await fetchNotifications();
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
