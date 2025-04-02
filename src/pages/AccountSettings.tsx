
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Check, UserCog, MapPin, Shield, Settings } from "lucide-react";

const AccountSettings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    custom_email: "",
    country: "",
    state: "",
    district: "",
    place: ""
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      toast.error("Please login to access account settings");
      return;
    }
    
    if (profile) {
      setFormData({
        display_name: profile.display_name || profile.full_name || "",
        custom_email: profile.custom_email || user.email || "",
        country: profile.country || "",
        state: profile.state || "",
        district: profile.district || "",
        place: profile.place || ""
      });
    }
  }, [profile, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          custom_email: formData.custom_email,
          country: formData.country,
          state: formData.state,
          district: formData.district,
          place: formData.place,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Profile updated successfully");
      refreshProfile();
      
      // Add notification for user
      try {
        await supabase
          .from("notifications")
          .insert({
            user_id: user.id,
            title: "Profile Updated",
            message: "Your account information has been updated successfully.",
            type: "success"
          });
      } catch (error) {
        console.error("Failed to add notification:", error);
      }
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return <Loading />;
  }

  return (
    <PageLayout title="Account Settings" requireAuth={true}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full mb-4">
          <TabsTrigger value="profile">
            <UserCog className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="mr-2 h-4 w-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Update your profile picture. This will be visible to other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ProfilePictureUpload
                currentAvatarUrl={profile.avatar_url}
                username={profile.username}
                onUploadComplete={refreshProfile}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="Your display name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom_email">Email Address</Label>
                  <Input
                    id="custom_email"
                    name="custom_email"
                    value={formData.custom_email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4" />
                  <span>MPA ID: {profile.mpa_id || `${profile.username}@mpa`}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4" />
                  <span>Referral Code: {profile.referral_code || "Not set"}</span>
                </div>
                
                {profile.referred_by && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4" />
                    <span>Referred by: {profile.referred_by}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>
                Update your location details. This information helps us tailor services to your location.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Your state or province"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Your district"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    placeholder="Your place"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveProfile} 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline">Change Password</Button>
              <div>
                <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="secondary">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preference</CardTitle>
              <CardDescription>
                Customize your app appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={profile.theme_preference || "system"}
                  onValueChange={async (value) => {
                    try {
                      await supabase
                        .from('profiles')
                        .update({ theme_preference: value })
                        .eq('id', user.id);
                      
                      toast.success("Theme updated");
                      refreshProfile();
                    } catch (error) {
                      toast.error("Failed to update theme");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default AccountSettings;
