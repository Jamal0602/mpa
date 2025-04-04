
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CreditCard, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function FloatingTab() {
  const [expanded, setExpanded] = useState(false);
  const { user, profile } = useAuth();
  const { unreadCount } = useNotifications();
  
  const toggleExpand = () => setExpanded(!expanded);
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-8 right-1/2 translate-x-1/2 z-50">
      <AnimatePresence>
        {expanded ? (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-card border rounded-lg shadow-lg p-4 flex flex-col gap-4 min-w-[300px]"
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
            className="bg-card border rounded-full shadow-lg flex items-center p-2 gap-2"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full" 
              onClick={toggleExpand}
              aria-label="Show notifications and quick access"
            >
              <CreditCard className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1" variant="default">{profile?.key_points || 0}</Badge>
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full" 
              onClick={toggleExpand}
              aria-label="Show notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
