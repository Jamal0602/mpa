
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
      .select('value')
      .eq('id', 'construction')
      .single();
    
    if (error) {
      console.error('Error fetching construction progress:', error);
      return 5; // Default value if we can't fetch
    }
    
    return data?.value?.construction_progress || 5;
  } catch (error) {
    console.error('Failed to get construction progress:', error);
    return 5; // Default to 5% if there's an error
  }
};

/**
 * Update construction progress
 */
export const updateProgress = async (progress: number): Promise<boolean> => {
  try {
    // Ensure the progress is between 0 and 100
    const validProgress = Math.min(Math.max(progress, 0), 100);
    
    // Use the RPC function we created to update the progress
    const { error } = await supabase.rpc('update_construction_progress', { 
      progress: validProgress 
    });
    
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
 * Toggle construction mode
 */
export const toggleConstructionMode = async (enabled: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('toggle_construction_mode', { 
      enable: enabled 
    });
    
    if (error) {
      console.error('Error toggling construction mode:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to toggle construction mode:', error);
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

/**
 * Start a construction phase
 */
export const startPhase = async (phaseId: string): Promise<boolean> => {
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
        status: 'in-progress',
        started_at: new Date().toISOString()
      })
      .eq('id', phaseId);
    
    if (phaseError) {
      console.error(`Error starting phase ${phaseId}:`, phaseError);
      return false;
    }
    
    // Update overall progress to start of phase
    await updateProgress(phase.startProgress);
    
    return true;
  } catch (error) {
    console.error(`Failed to start phase ${phaseId}:`, error);
    return false;
  }
};

/**
 * Get all construction phases with their current status
 */
export const getConstructionPhases = async (): Promise<ConstructionPhase[]> => {
  try {
    const { data, error } = await supabase
      .from('construction_phases')
      .select('*')
      .order('start_progress', { ascending: true });
    
    if (error) {
      console.error('Error fetching construction phases:', error);
      return CONSTRUCTION_PHASES;
    }
    
    if (!data || data.length === 0) {
      return CONSTRUCTION_PHASES;
    }
    
    // Map the DB data to our ConstructionPhase interface
    return data.map(phase => ({
      id: phase.id,
      name: phase.name,
      description: phase.description,
      startProgress: phase.start_progress,
      endProgress: phase.end_progress,
      status: phase.status as 'pending' | 'in-progress' | 'completed',
      completedAt: phase.completed_at
    }));
  } catch (error) {
    console.error('Failed to get construction phases:', error);
    return CONSTRUCTION_PHASES;
  }
};
