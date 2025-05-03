
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { 
  fetchConstructionSettings, 
  fetchConstructionPhases, 
  ConstructionPhase, 
  ConstructionSettings 
} from "@/utils/constructionProgress";

interface ConstructionPopupProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const ConstructionPopup: React.FC<ConstructionPopupProps> = ({
  onClose,
  showCloseButton = false,
}) => {
  const [settings, setSettings] = useState<ConstructionSettings | null>(null);
  const [phases, setPhases] = useState<ConstructionPhase[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tapCount, setTapCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const constructionSettings = await fetchConstructionSettings();
      const constructionPhases = await fetchConstructionPhases();
      
      setSettings(constructionSettings);
      setPhases(constructionPhases);
      setIsLoading(false);
      
      // Hide popup if construction mode is disabled
      if (constructionSettings && !constructionSettings.construction_mode) {
        setIsVisible(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close popup after 10 taps
    if (tapCount >= 10) {
      handleClose();
    }
  }, [tapCount]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  const handleTap = () => {
    setTapCount(prevCount => prevCount + 1);
  };
  
  const getPhaseStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const getPhaseStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!settings?.construction_mode || !isVisible) {
    return null;
  }

  const progress = settings?.construction_progress || 0;
  
  // Calculate estimated time remaining based on current progress
  const estimatedTimeRemaining = () => {
    // Assuming 100% takes about 2 days (48 hours) to complete
    const hoursRemaining = (100 - progress) * 0.48;
    
    if (hoursRemaining < 1) {
      return 'Less than an hour';
    } else if (hoursRemaining < 24) {
      return `About ${Math.ceil(hoursRemaining)} hours`;
    } else {
      return `About ${Math.ceil(hoursRemaining / 24)} days`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md p-4"
          onClick={handleTap}
        >
          <Card className="border shadow-lg">
            <CardHeader className="relative">
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-2 top-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-xl text-center">
                Site Under Construction
              </CardTitle>
              <CardDescription className="text-center">
                We're building something awesome! (Tap {10 - tapCount} more times to dismiss)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-center">
                <p className="font-bold text-2xl">{Math.floor(progress)}%</p>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground pt-1">
                  Estimated time remaining: {estimatedTimeRemaining()}
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium">Current progress:</p>
                  {phases.map((phase) => (
                    <div 
                      key={phase.id}
                      className={`flex items-center p-2 rounded-md border ${
                        phase.status === 'in-progress' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                        phase.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                        'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="mr-2">
                        {getPhaseStatusIcon(phase.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{phase.name}</p>
                          {getPhaseStatusBadge(phase.status)}
                        </div>
                        {phase.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {phase.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-xs text-center text-muted-foreground">
                Our team is working hard to bring you an enhanced experience.
                <br />
                Thank you for your patience!
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
