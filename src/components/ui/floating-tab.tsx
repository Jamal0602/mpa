
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CreditCard, Plus, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';

export function FloatingTab() {
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { user, profile } = useAuth();
  const { unreadCount, notifications } = useNotifications();
  const [scrollY, setScrollY] = useState(0);
  const [newNotifications, setNewNotifications] = useState<string[]>([]);
  
  const toggleExpand = () => setExpanded(!expanded);
  
  // Hide the tab when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(scrollY > currentScrollY || currentScrollY < 100);
      setScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;
    
    const notificationIds = notifications.map(n => n.id);
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Track new notifications to highlight
          if (payload.new && payload.new.id) {
            setNewNotifications(prev => [...prev, payload.new.id]);
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
              setNewNotifications(prev => 
                prev.filter(id => id !== payload.new.id)
              );
            }, 5000);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, notifications]);
  
  if (!user) return null;
  
  return (
    <div className="fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-300"
      style={{
        bottom: isVisible ? '24px' : '-100px',
      }}
    >
      <AnimatePresence>
        {expanded ? (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-card border rounded-lg shadow-lg p-4 flex flex-col gap-4 min-w-[300px] max-w-[95vw]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Quick Access</h3>
              <Button variant="ghost" size="icon" onClick={toggleExpand}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Spark Points
                  </Badge>
                  <span className="font-semibold text-xl">{profile?.key_points || 0}</span>
                </div>
                <Link to="/subscription">
                  <Button variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Buy SP
                  </Button>
                </Link>
              </div>
              
              <Separator />
              
              <NotificationCenter />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-card border rounded-full shadow-lg flex items-center p-1.5 gap-2"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative rounded-full px-3 flex items-center gap-2" 
              onClick={toggleExpand}
              aria-label="Show points and notifications"
            >
              <CreditCard className="h-4 w-4" />
              <span className="font-medium text-sm">{profile?.key_points || 0} SP</span>
              
              <Separator orientation="vertical" className="h-4 mx-0.5" />
              
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
              
              <ChevronUp className="h-3 w-3 ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
