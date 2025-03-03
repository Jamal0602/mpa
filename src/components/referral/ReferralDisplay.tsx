
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check, ClipboardIcon } from "lucide-react";

interface ReferralDisplayProps {
  referralCode: string;
  referralLink: string;
  loading: boolean;
}

export const ReferralDisplay = ({ referralCode, referralLink, loading }: ReferralDisplayProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard",
        });
      },
      (err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive",
        });
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on our platform!',
          text: 'Use my referral link to join and get bonus Spark Points!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyToClipboard();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Referral Code</CardTitle>
        <CardDescription>
          Invite friends to join and both of you will receive 10 Spark Points when they sign up!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="referral-code">Your Referral Code</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input 
                  id="referral-code" 
                  value={referralCode} 
                  readOnly 
                  className="font-medium"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast({ description: "Code copied to clipboard" });
                  }}
                >
                  <ClipboardIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="referral-link">Referral Link</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input 
                  id="referral-link" 
                  value={referralLink} 
                  readOnly 
                  className="font-medium text-xs sm:text-sm"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleCopyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button className="w-full sm:w-auto" onClick={handleCopyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </Button>
        <Button className="w-full sm:w-auto" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};
