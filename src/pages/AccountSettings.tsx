
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface LocationData {
  country: string;
  state: string;
  district: string;
  place: string;
}

const AccountSettings = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState<LocationData>({
    country: "",
    state: "",
    district: "",
    place: "",
  });
  const [displayName, setDisplayName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("country, state, district, place, display_name, custom_email")
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
          setDisplayName(data.display_name || "");
          setCustomEmail(data.custom_email || "");
        }
      } catch (error: any) {
        toast.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

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
            setDisplayName(payload.new.display_name || "");
            setCustomEmail(payload.new.custom_email || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSaveChanges = async () => {
    try {
      const updates = {
        ...locationData,
        display_name: displayName,
        custom_email: customEmail,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error: any) {
      toast.error("Error updating profile");
    }
  };

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

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-[spin_2s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 bg-primary rounded-full animate-[ping_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Badge variant="secondary" className="animate-fade-in">
              Admin
            </Badge>
          )}
          {editing ? (
            <Button onClick={handleSaveChanges} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      
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
              disabled={uploading || !editing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!editing}
            placeholder="Enter your display name"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={customEmail || user.email}
            onChange={(e) => setCustomEmail(e.target.value)}
            disabled={!editing}
          />
        </div>

        <div className="space-y-2">
          <Label>MPA ID</Label>
          <Input value={`${user.user_metadata.username}@mpa`} disabled />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Location Details</h2>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={locationData.country}
              onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="space-y-2">
            <Label>State</Label>
            <Input
              value={locationData.state}
              onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <Input
              value={locationData.district}
              onChange={(e) => setLocationData({ ...locationData, district: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="space-y-2">
            <Label>Place</Label>
            <Input
              value={locationData.place}
              onChange={(e) => setLocationData({ ...locationData, place: e.target.value })}
              disabled={!editing}
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
