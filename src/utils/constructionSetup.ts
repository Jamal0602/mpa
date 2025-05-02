
import { supabase } from '@/lib/supabase';
import { autoAdvancePhases, incrementProgress } from './constructionProgress';

/**
 * Initialize the construction process with some progress
 */
export const initializeConstructionProgress = async (): Promise<void> => {
  // Update progress to show some initial work
  await incrementProgress(15);
  await autoAdvancePhases();
};

/**
 * Function to be called by an admin to complete a phase
 */
export const completeCurrentPhase = async (): Promise<boolean> => {
  try {
    // Get current in-progress phase
    const { data: phases, error } = await supabase
      .from('construction_phases')
      .select('*')
      .eq('status', 'in-progress');
    
    if (error) {
      console.error('Error fetching phases:', error);
      return false;
    }
    
    if (phases && phases.length > 0) {
      const currentPhase = phases[0];
      
      // Mark the phase as completed
      const { error: updateError } = await supabase
        .from('construction_phases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentPhase.id);
      
      if (updateError) {
        console.error('Error completing phase:', updateError);
        return false;
      }
      
      // Update the progress
      await incrementProgress(currentPhase.end_progress - currentPhase.start_progress);
      await autoAdvancePhases();
      
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error in completeCurrentPhase:', e);
    return false;
  }
};

// Initialize with a bit of progress on application start
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initializeConstructionProgress();
  }, 5000); // Delay to allow app to fully load
}
