
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface LocationData {
  country: string;
  state: string;
  district: string;
  place: string;
}

const AccountSettings = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState<LocationData>({
    country: "",
    state: "",
    district: "",
    place: "",
  });

  useEffect(() => {
    if (!user) return;

    // Initial fetch of profile data
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("country, state, district, place")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setLocationData({
            country: data.country || "",
            state: data.state || "",
            district: data.district || "",
            place: data.place || "",
          });
        }
      } catch (error: any) {
        toast.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    // Set up real-time subscription
    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            setLocationData({
              country: payload.new.country || "",
              state: payload.new.state || "",
              district: payload.new.district || "",
              place: payload.new.place || "",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLocationChange = async (field: keyof LocationData, value: string) => {
    try {
      const updates = { [field]: value };
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (error) throw error;
      setLocationData(prev => ({ ...prev, [field]: value }));
    } catch (error: any) {
      toast.error("Error updating location");
    }
  };

  const detectLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();

      const updates = {
        country: data.countryName,
        state: data.principalSubdivision,
        district: data.localityInfo.administrative[2]?.name || "",
        place: data.locality || "",
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (error) throw error;
      setLocationData(updates);
      toast.success("Location updated successfully!");
    } catch (error: any) {
      toast.error("Error detecting location");
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email} disabled />
        </div>

        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={user.user_metadata.full_name || ""} disabled />
        </div>

        <div className="space-y-2">
          <Label>MPA ID</Label>
          <Input value={user.id} disabled />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Location Details</h2>
            <Button onClick={detectLocation} variant="outline">
              Auto-detect Location
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={locationData.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>State</Label>
            <Input
              value={locationData.state}
              onChange={(e) => handleLocationChange("state", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <Input
              value={locationData.district}
              onChange={(e) => handleLocationChange("district", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Place</Label>
            <Input
              value={locationData.place}
              onChange={(e) => handleLocationChange("place", e.target.value)}
            />
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
