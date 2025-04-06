
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentProgress } from '@/utils/constructionProgress';

interface ConstructionPopupProps {
  initialProgress?: number;
  autoDeleteWhenComplete?: boolean;
}

export const ConstructionPopup: React.FC<ConstructionPopupProps> = ({
  initialProgress = 5,
  autoDeleteWhenComplete = true
}) => {
  const [progress, setProgress] = useState(initialProgress);
  const [isVisible, setIsVisible] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(!autoDeleteWhenComplete);

  // Function to fetch the current construction progress
  const fetchProgress = async () => {
    try {
      const currentProgress = await getCurrentProgress();
      setProgress(currentProgress);
      
      // Auto-hide when complete
      if (autoDeleteWhenComplete && currentProgress >= 100) {
        setTimeout(() => {
          setIsVisible(false);
        }, 3000); // Show completion for 3 seconds before hiding
      }
      
      // Allow manual close when above 50% complete
      if (currentProgress > 50) {
        setShowCloseButton(true);
      }
    } catch (error) {
      console.error('Failed to fetch construction progress:', error);
    }
  };

  // Fetch progress on mount and every 5 minutes
  useEffect(() => {
    fetchProgress();
    const intervalId = setInterval(fetchProgress, 300000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, [autoDeleteWhenComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Card className="w-full max-w-md shadow-lg border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></span>
                Site Under Construction
              </CardTitle>
              <CardDescription className="text-center">
                We're working on exciting improvements to enhance your experience!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <span className="absolute right-0 top-3 text-xs">{progress}% Complete</span>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md text-sm">
                <p>We're implementing:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Improved database connections</li>
                  <li>Enhanced API integrations</li>
                  <li>Redesigned user interfaces</li>
                  <li>Advanced service management</li>
                  <li>Optimized workflow systems</li>
                </ul>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Thank you for your patience while we make these improvements.</p>
                <p className="mt-2">
                  <span className="font-semibold">Powered by</span>{" "}
                  <a 
                    href="https://cubiz.space" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    CUBIZ.SPACE
                  </a>
                </p>
              </div>
            </CardContent>
            {showCloseButton && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsVisible(false)}
                >
                  Continue to Site
                </Button>
              </CardFooter>
            )}
            {showCloseButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2" 
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConstructionPopup;
