
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Copy, 
  Check, 
  ClipboardIcon, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail, 
  ExternalLink,
  UserPlus
} from "lucide-react";

interface ReferralDisplayProps {
  referralCode: string;
  referralLink: string;
  loading: boolean;
}

export const ReferralDisplay = ({ referralCode, referralLink, loading }: ReferralDisplayProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyCodeToClipboard = () => {
    navigator.clipboard.writeText(referralCode).then(
      () => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast({
          description: "Referral code copied to clipboard",
        });
      },
      (err) => {
        console.error("Failed to copy: ", err);
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

  const openShareUrl = (platform: string) => {
    let shareUrl = '';
    const text = encodeURIComponent('Join me and get 10 Spark Points! Use my referral code: ' + referralCode);
    const url = encodeURIComponent(referralLink);
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=Referral&summary=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join%20me%20and%20get%20rewards&body=${text}%20${url}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Share Your Referral Code</CardTitle>
        </div>
        <CardDescription>
          Invite friends to join and both of you will receive 10 Spark Points when they sign up!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
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
                  onClick={handleCopyCodeToClipboard}
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
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
            
            <div className="pt-2">
              <Label className="mb-2 block">Share via</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20"
                  onClick={() => openShareUrl('twitter')}
                >
                  <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  <span className="sr-only">Share on Twitter</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-[#4267B2]/10 hover:bg-[#4267B2]/20"
                  onClick={() => openShareUrl('facebook')}
                >
                  <Facebook className="h-4 w-4 text-[#4267B2]" />
                  <span className="sr-only">Share on Facebook</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-[#0077B5]/10 hover:bg-[#0077B5]/20"
                  onClick={() => openShareUrl('linkedin')}
                >
                  <Linkedin className="h-4 w-4 text-[#0077B5]" />
                  <span className="sr-only">Share on LinkedIn</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => openShareUrl('email')}
                >
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Share via Email</span>
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
        <Button 
          variant="outline" 
          className="w-full sm:w-auto" 
          onClick={() => window.open('https://help.example.com/referrals', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};
