
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, RotateCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CONSTRUCTION_PHASES, updateProgress, completePhase } from '@/utils/constructionProgress';
import { toast } from 'sonner';

const ConstructionManager: React.FC = () => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [phases, setPhases] = useState(CONSTRUCTION_PHASES);
  const [loading, setLoading] = useState(false);

  const fetchConstructionStatus = async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('app_settings')
        .select('construction_progress')
        .single();
        
      if (settingsError) throw settingsError;
      
      setCurrentProgress(settingsData?.construction_progress || 0);
      
      // Fetch phases status
      const { data: phasesData, error: phasesError } = await supabase
        .from('construction_phases')
        .select('*')
        .order('start_progress', { ascending: true });
        
      if (phasesError) throw phasesError;
      
      if (phasesData && phasesData.length > 0) {
        // Update local phases with database data
        const updatedPhases = [...CONSTRUCTION_PHASES].map(phase => {
          const dbPhase = phasesData.find(p => p.id === phase.id);
          return dbPhase ? { ...phase, ...dbPhase } : phase;
        });
        
        setPhases(updatedPhases);
      }
    } catch (error) {
      console.error('Error fetching construction status:', error);
      toast.error('Failed to load construction status');
    }
  };

  useEffect(() => {
    fetchConstructionStatus();
  }, []);

  const handlePhaseAction = async (phase: typeof phases[0]) => {
    setLoading(true);
    
    try {
      if (phase.status === 'pending') {
        // Start the phase
        const { error } = await supabase
          .from('construction_phases')
          .update({ 
            status: 'in-progress',
            started_at: new Date().toISOString()
          })
          .eq('id', phase.id);
          
        if (error) throw error;
        
        // Update progress to start of phase
        await updateProgress(phase.startProgress);
        
        toast.success(`Started phase: ${phase.name}`);
      } else if (phase.status === 'in-progress') {
        // Complete the phase
        const success = await completePhase(phase.id);
        
        if (!success) throw new Error('Failed to complete phase');
        
        toast.success(`Completed phase: ${phase.name}`);
      }
      
      fetchConstructionStatus();
    } catch (error) {
      console.error(`Error updating phase ${phase.id}:`, error);
      toast.error('Failed to update construction phase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Construction Progress Management</CardTitle>
        <CardDescription>
          Control the site construction phases and progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2 items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm">{currentProgress.toFixed(1)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium mb-4">Construction Phases</h3>
          
          {phases.map((phase) => (
            <div key={phase.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{phase.name}</h4>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={
                      phase.status === 'completed' ? 'default' : 
                      phase.status === 'in-progress' ? 'outline' : 'secondary'
                    }>
                      {phase.status}
                    </Badge>
                    <Badge variant="secondary">{phase.startProgress}% - {phase.endProgress}%</Badge>
                  </div>
                </div>
                
                <Button 
                  variant={phase.status === 'completed' ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handlePhaseAction(phase)}
                  disabled={loading || 
                    (phase.status === 'pending' && 
                      phases.findIndex(p => p.id === phase.id) > 0 && 
                      phases[phases.findIndex(p => p.id === phase.id) - 1].status !== 'completed')
                  }
                >
                  {phase.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {phase.status === 'in-progress' && <RotateCw className="h-4 w-4 mr-1" />}
                  {phase.status === 'pending' && <Circle className="h-4 w-4 mr-1" />}
                  
                  {phase.status === 'completed' ? 'Completed' : 
                   phase.status === 'in-progress' ? 'Mark Complete' : 'Start Phase'}
                </Button>
              </div>
              
              {phase.status === 'in-progress' && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1 items-center">
                    <span className="text-xs">Phase Progress</span>
                    <span className="text-xs">
                      {Math.max(
                        0, 
                        Math.min(
                          100, 
                          ((currentProgress - phase.startProgress) / 
                          (phase.endProgress - phase.startProgress)) * 100
                        )
                      ).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(
                      0, 
                      Math.min(
                        100, 
                        ((currentProgress - phase.startProgress) / 
                        (phase.endProgress - phase.startProgress)) * 100
                      )
                    )} 
                    className="h-1" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={fetchConstructionStatus} disabled={loading}>
          <RotateCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
        
        <Button 
          onClick={async () => {
            setLoading(true);
            try {
              await updateProgress(100);
              toast.success('Construction marked as complete');
              fetchConstructionStatus();
            } catch (error) {
              toast.error('Failed to update construction status');
            } finally {
              setLoading(false);
            }
          }} 
          disabled={loading || currentProgress < 95}
        >
          Complete All Construction
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConstructionManager;
