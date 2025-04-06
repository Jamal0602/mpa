
import { supabase } from '@/lib/supabase';

export interface ConstructionPhase {
  id: string;
  name: string;
  description: string;
  startProgress: number;
  endProgress: number;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
}

// The construction phases for the application
export const CONSTRUCTION_PHASES: ConstructionPhase[] = [
  {
    id: 'phase1',
    name: 'Initial Setup',
    description: 'Setting up construction mode and database connections',
    startProgress: 0,
    endProgress: 10,
    status: 'in-progress'
  },
  {
    id: 'phase2',
    name: 'Database Restructuring',
    description: 'Improving database schema and connections',
    startProgress: 10,
    endProgress: 30,
    status: 'pending'
  },
  {
    id: 'phase3',
    name: 'API Integration',
    description: 'Rebuilding API connections and gateways',
    startProgress: 30,
    endProgress: 50,
    status: 'pending'
  },
  {
    id: 'phase4',
    name: 'System Enhancements',
    description: 'Advanced systems for services, points, and management',
    startProgress: 50,
    endProgress: 70,
    status: 'pending'
  },
  {
    id: 'phase5',
    name: 'UI Redesign',
    description: 'Complete redesign of all pages and components',
    startProgress: 70,
    endProgress: 95,
    status: 'pending'
  },
  {
    id: 'phase6',
    name: 'Final Testing',
    description: 'Testing and finalizing all features',
    startProgress: 95,
    endProgress: 100,
    status: 'pending'
  }
];

/**
 * Get current construction progress
 */
export const getCurrentProgress = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('construction_progress')
      .single();
    
    if (error) {
      console.error('Error fetching construction progress:', error);
      return 0;
    }
    
    return data?.construction_progress || 0;
  } catch (error) {
    console.error('Failed to get construction progress:', error);
    return 0;
  }
};

/**
 * Update construction progress
 */
export const updateProgress = async (progress: number): Promise<boolean> => {
  try {
    // Ensure the progress is between 0 and 100
    const validProgress = Math.min(Math.max(progress, 0), 100);
    
    const { error } = await supabase
      .from('app_settings')
      .update({ construction_progress: validProgress })
      .eq('id', 'construction');
    
    if (error) {
      console.error('Error updating construction progress:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update construction progress:', error);
    return false;
  }
};

/**
 * Mark a construction phase as completed
 */
export const completePhase = async (phaseId: string): Promise<boolean> => {
  try {
    const phase = CONSTRUCTION_PHASES.find(p => p.id === phaseId);
    if (!phase) {
      console.error(`Phase not found: ${phaseId}`);
      return false;
    }
    
    // Update phase status in database
    const { error: phaseError } = await supabase
      .from('construction_phases')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', phaseId);
    
    if (phaseError) {
      console.error(`Error updating phase ${phaseId}:`, phaseError);
      return false;
    }
    
    // Update overall progress
    await updateProgress(phase.endProgress);
    
    return true;
  } catch (error) {
    console.error(`Failed to complete phase ${phaseId}:`, error);
    return false;
  }
};
