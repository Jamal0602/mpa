
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { fetchConstructionSettings, fetchConstructionPhases, ConstructionPhase } from "@/utils/constructionProgress";

export function ConstructionUpdate() {
  const [progress, setProgress] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<ConstructionPhase | null>(null);
  const [isConstructionMode, setIsConstructionMode] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const settings = await fetchConstructionSettings();
      const phases = await fetchConstructionPhases();
      
      if (settings) {
        setProgress(settings.construction_progress);
        setIsConstructionMode(settings.construction_mode);
      }
      
      if (phases && phases.length > 0) {
        // Find current phase
        const inProgressPhase = phases.find(p => p.status === 'in-progress');
        if (inProgressPhase) {
          setCurrentPhase(inProgressPhase);
        } else {
          // If no in-progress phase, find the next pending phase
          const nextPhase = phases.find(p => p.status === 'pending');
          if (nextPhase) {
            setCurrentPhase(nextPhase);
          }
        }
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isConstructionMode) {
    return null;
  }
  
  return (
    <Card className="border shadow-md bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Site Construction Update</CardTitle>
          <Badge variant="outline">{Math.floor(progress)}% Complete</Badge>
        </div>
        <CardDescription>
          We're working to improve your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 mb-4" />
        
        {currentPhase && (
          <div className="text-sm">
            <div className="font-medium">Current Phase: {currentPhase.name}</div>
            {currentPhase.description && (
              <p className="text-muted-foreground mt-1">{currentPhase.description}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        We appreciate your patience while we enhance MPA
      </CardFooter>
    </Card>
  );
}
