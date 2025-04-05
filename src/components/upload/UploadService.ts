
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const verifyUserBalance = async (userId: string, requiredPoints: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("key_points")
      .eq("id", userId)
      .single();
      
    if (error) throw error;
    
    const userPoints = data?.key_points || 0;
    return userPoints >= requiredPoints;
  } catch (error: any) {
    console.error('Error verifying user balance:', error);
    return false;
  }
};

export const deductUserPoints = async (
  userId: string, 
  amount: number, 
  description: string
): Promise<boolean> => {
  try {
    // Update profile with new point balance
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        key_points: supabase.rpc('decrement_points', { 
          user_id: userId, 
          amount_to_deduct: amount 
        }) 
      })
      .eq("id", userId)
      .select("key_points");
    
    if (profileError) throw profileError;
    
    // Record the transaction
    const { error: transactionError } = await supabase
      .from("key_points_transactions")
      .insert({
        user_id: userId,
        amount: -amount,
        description: description,
        transaction_type: 'spend'
      });
    
    if (transactionError) throw transactionError;
    
    return true;
  } catch (error: any) {
    console.error('Error deducting points:', error);
    toast.error(`Failed to process payment: ${error.message}`);
    return false;
  }
};

export const simulateUploadProgress = (
  setProgress: (value: number) => void, 
  maxProgress: number = 95
): () => void => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > maxProgress) {
      progress = maxProgress;
      clearInterval(interval);
    }
    setProgress(Math.min(progress, maxProgress));
  }, 300);
  
  return () => clearInterval(interval);
};

export const createServiceProject = async (
  userId: string,
  serviceId: string,
  serviceName: string,
  serviceDescription: string
): Promise<boolean> => {
  try {
    // Create a new project record for the purchased service
    const { error: projectError } = await supabase
      .from("projects")
      .insert({
        title: `Service: ${serviceName}`,
        description: serviceDescription,
        user_id: userId,
        category: "service",
        type: "purchased",
        status: "pending",
        file_format: "service" // Default file format for services
      });
      
    if (projectError) throw projectError;
    
    return true;
  } catch (error: any) {
    console.error("Error creating service project:", error);
    toast.error(`Failed to create project: ${error.message}`);
    return false;
  }
};

export const verifyTransactionHistory = async (userId: string, amount: number): Promise<boolean> => {
  try {
    // Query the transaction history to verify the transaction
    const { data, error } = await supabase
      .from("key_points_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("amount", -amount)
      .eq("transaction_type", "spend")
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    // If we found a matching transaction, return true
    return data && data.length > 0;
  } catch (error: any) {
    console.error("Error verifying transaction:", error);
    return false;
  }
};
