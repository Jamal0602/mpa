
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, AlertTriangle } from "lucide-react";

interface UploadSidebarProps {
  userPoints: number;
  uploadCost: number;
}

export const UploadSidebar = ({ userPoints, uploadCost }: UploadSidebarProps) => {
  const hasEnoughPoints = userPoints >= uploadCost;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Cost</CardTitle>
          <CardDescription>
            Key Points required for this upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">{uploadCost} Key Points</span>
            </div>
            <Badge variant={hasEnoughPoints ? "default" : "destructive"}>
              {hasEnoughPoints ? "Available" : "Insufficient"}
            </Badge>
          </div>
          
          <div className="mt-4 text-sm">
            Your balance: <span className="font-medium">{userPoints} Points</span>
          </div>
        </CardContent>
      </Card>
      
      {!hasEnoughPoints && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Insufficient Key Points</AlertTitle>
          <AlertDescription>
            You need at least {uploadCost} Key Points to upload. Earn more by engaging with the platform.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Maximum file size: 100MB</p>
          <p>• Supported formats: PDF, images, documents, videos</p>
          <p>• All uploads are reviewed by moderators</p>
          <p>• Inappropriate content will be removed</p>
          <p>• You must own the rights to uploaded content</p>
        </CardContent>
      </Card>
    </div>
  );
};
