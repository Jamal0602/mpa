
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCheck, Shield } from "lucide-react";

interface UploadSidebarProps {
  userPoints: number;
  uploadCost: number;
}

export const UploadSidebar = ({ userPoints, uploadCost }: UploadSidebarProps) => {
  // Upload is free now
  const hasEnoughPoints = true;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Services</CardTitle>
          <CardDescription>
            Free upload, pay only for additional services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Upload is now FREE</span>
            </div>
            <Badge variant="default">Free</Badge>
          </div>
          
          <div className="mt-4 text-sm">
            Your balance: <span className="font-medium">{userPoints} Points</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Upload Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Maximum file size: 100MB</p>
          <p>• Supported formats: PDF, images, documents, videos</p>
          <p>• All uploads are reviewed by moderators</p>
          <p>• Inappropriate content will be removed</p>
          <p>• You must own the rights to uploaded content</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Your project will be reviewed within 24-48 hours</p>
          <p>• You'll receive a notification once approved</p>
          <p>• Approved projects will appear on the platform</p>
          <p>• You may earn additional Key Points if your project is featured</p>
          <p>• Check our Services tab for premium options</p>
        </CardContent>
      </Card>
    </div>
  );
};
