
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null;
  username?: string;
  onUploadComplete?: (url: string) => void;
}

export function ProfilePictureUpload({
  currentAvatarUrl,
  username = "",
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Function to convert File to base64 for preview
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should not exceed 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Show preview immediately
      const base64 = await fileToBase64(file);
      setAvatarUrl(base64);

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update avatar URL state and notify parent component
      setAvatarUrl(publicUrl);
      if (onUploadComplete) onUploadComplete(publicUrl);
      
      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(`Failed to upload image: ${error.message}`);
      // Revert to original avatar if there was an error
      setAvatarUrl(currentAvatarUrl);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      
      // Create a new file input event to reuse the same handler
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        // Trigger change event manually
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <div 
      className="flex flex-col items-center space-y-4"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative group">
        <Avatar className="h-32 w-32 border-2 border-primary/20">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-4xl">
            {username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div 
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={triggerFileInput}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button 
        variant="outline" 
        onClick={triggerFileInput} 
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> 
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" /> 
            {currentAvatarUrl ? "Change" : "Upload"} Picture
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Drag and drop an image here, or click to select a file.<br />
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  );
}
