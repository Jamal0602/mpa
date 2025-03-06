
import { supabase } from '@/lib/supabase';
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
    // Update the profile key_points
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        key_points: supabase.rpc('decrement_points', { amount_to_deduct: amount }) 
      })
      .eq("id", userId);
    
    if (updateError) throw updateError;
    
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
