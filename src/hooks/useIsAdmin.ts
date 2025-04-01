
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      // First try to use the RPC function if available
      try {
        const { data: isAdminRPC, error: rpcError } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        
        if (!rpcError && typeof isAdminRPC === 'boolean') {
          return isAdminRPC;
        }
      } catch (e) {
        console.log("RPC is_admin not available, falling back to direct query");
      }
      
      // Fallback to direct query
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !data) return false;
      return data.role === "admin";
    },
    enabled: !!user,
  });
};
