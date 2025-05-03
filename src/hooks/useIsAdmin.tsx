
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        // First try using the is_admin function if available
        const { data: isAdminResult, error: funcError } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        
        if (!funcError && typeof isAdminResult === 'boolean') {
          return isAdminResult;
        }
        
        // Fallback to direct query
        const { data, error } = await supabase
          .from("MPA_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !data) return false;
        return data.role === "admin";
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
