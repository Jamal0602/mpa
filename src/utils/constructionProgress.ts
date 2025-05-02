
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Current construction phase information
 */
export interface ConstructionPhase {
  id: string;
  name: string;
  description: string | null;
  start_progress: number;
  end_progress: number;
  status: 'pending' | 'in-progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
}

/**
 * Construction settings from the database
 */
export interface ConstructionSettings {
  construction_mode: boolean;
  construction_progress: number;
}

/**
 * Fetch the current construction progress and settings
 */
export const fetchConstructionSettings = async (): Promise<ConstructionSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('id', 'construction')
      .single();
    
    if (error) {
      console.error('Error fetching construction settings:', error);
      return null;
    }
    
    return data?.value as ConstructionSettings;
  } catch (e) {
    console.error('Failed to fetch construction settings:', e);
    return null;
  }
};

/**
 * Fetch all construction phases
 */
export const fetchConstructionPhases = async (): Promise<ConstructionPhase[]> => {
  try {
    const { data, error } = await supabase
      .from('construction_phases')
      .select('*')
      .order('start_progress', { ascending: true });
    
    if (error) {
      console.error('Error fetching construction phases:', error);
      return [];
    }
    
    return data as ConstructionPhase[];
  } catch (e) {
    console.error('Failed to fetch construction phases:', e);
    return [];
  }
};

/**
 * Update construction progress
 * @param progress The new progress value (0-100)
 */
export const updateConstructionProgress = async (progress: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('update_construction_progress', { progress });
    
    if (error) {
      console.error('Error updating construction progress:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Failed to update construction progress:', e);
    return false;
  }
};

/**
 * Update the status of a construction phase
 * @param phaseId The ID of the phase to update
 * @param status The new status
 */
export const updatePhaseStatus = async (
  phaseId: string, 
  status: 'pending' | 'in-progress' | 'completed'
): Promise<boolean> => {
  try {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'in-progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('construction_phases')
      .update(updateData)
      .eq('id', phaseId);
    
    if (error) {
      console.error('Error updating phase status:', error);
      return false;
    }
    
    // Update progress based on phase completion
    if (status === 'completed') {
      const phases = await fetchConstructionPhases();
      const completedPhase = phases.find(p => p.id === phaseId);
      if (completedPhase) {
        await updateConstructionProgress(completedPhase.end_progress);
      }
    }
    
    return true;
  } catch (e) {
    console.error('Failed to update phase status:', e);
    return false;
  }
};

/**
 * Auto-advance construction phases based on current progress
 */
export const autoAdvancePhases = async (): Promise<void> => {
  try {
    const settings = await fetchConstructionSettings();
    const phases = await fetchConstructionPhases();
    
    if (!settings || !phases.length) return;
    
    const currentProgress = settings.construction_progress;
    
    // Update phases based on progress
    for (const phase of phases) {
      if (currentProgress >= phase.end_progress && phase.status !== 'completed') {
        // Mark as completed
        await updatePhaseStatus(phase.id, 'completed');
        toast.success(`Phase completed: ${phase.name}`);
      } else if (currentProgress >= phase.start_progress && 
                currentProgress < phase.end_progress && 
                phase.status === 'pending') {
        // Mark as in-progress
        await updatePhaseStatus(phase.id, 'in-progress');
        toast.info(`Started phase: ${phase.name}`);
      }
    }
    
    // Check if all phases are completed
    const allCompleted = phases.every(p => p.status === 'completed');
    if (allCompleted) {
      await supabase.rpc('toggle_construction_mode', { enable: false });
      toast.success('Construction completed! Site is now live.');
    }
  } catch (e) {
    console.error('Error in auto-advancing phases:', e);
  }
};

/**
 * Increment progress by a specific amount
 * @param amount Amount to increment (1-10 recommended)
 */
export const incrementProgress = async (amount: number = 5): Promise<void> => {
  const settings = await fetchConstructionSettings();
  if (!settings) return;
  
  const newProgress = Math.min(100, settings.construction_progress + amount);
  await updateConstructionProgress(newProgress);
  await autoAdvancePhases();
  
  if (newProgress >= 100) {
    toast.success('Construction completed!');
  }
};
