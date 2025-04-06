import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Pencil, Save, Github, Twitter, Instagram, Facebook, Mail, Loader2 } from 'lucide-react';
import { SafeLink, openExternalLink } from '@/utils/linkHandler';

interface FooterContent {
  id: string;
  about_text: string;
  contact_email: string;
  privacy_text: string;
  terms_text: string;
  social_links: {
    github: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
  created_at: string;
  updated_at: string;
}

interface FooterProps {
  showPoweredBy?: boolean;
}

export const Footer = ({ showPoweredBy = true }: FooterProps) => {
  const { data: isAdmin } = useIsAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [privacyText, setPrivacyText] = useState('');
  const [termsText, setTermsText] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    twitter: '',
    instagram: '',
    facebook: ''
  });

  const { data: footerContent, isLoading, refetch } = useQuery({
    queryKey: ['footer-content'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('footer_content')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        return data as FooterContent | null;
      } catch (err) {
        console.error("Error fetching footer content:", err);
        return null;
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<FooterContent, 'id' | 'created_at'>) => {
      if (footerContent?.id) {
        const { error } = await supabase
          .from('footer_content')
          .update(data)
          .eq('id', footerContent.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_content')
          .insert([data]);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Footer content updated successfully');
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error updating footer content: ${error.message}`);
    }
  });

  useEffect(() => {
    if (footerContent) {
      setAboutText(footerContent.about_text || '');
      setContactEmail(footerContent.contact_email || '');
      setPrivacyText(footerContent.privacy_text || '');
      setTermsText(footerContent.terms_text || '');
      setSocialLinks(footerContent.social_links || {
        github: '',
        twitter: '',
        instagram: '',
        facebook: ''
      });
    } else if (!isLoading) {
      setAboutText('Multi Project Association (MPA) is a platform for managing projects, collaborating with team members, and tracking progress.');
      setContactEmail('contact@mpa.example.com');
      setPrivacyText('Your privacy is important to us. We collect minimal data and use it only for service improvement.');
      setTermsText('By using MPA, you agree to our terms of service.');
      setSocialLinks({
        github: 'https://github.com',
        twitter: '',
        instagram: '',
        facebook: ''
      });
    }
  }, [footerContent, isLoading]);

  const handleSave = () => {
    saveMutation.mutate({
      about_text: aboutText,
      contact_email: contactEmail,
      privacy_text: privacyText,
      terms_text: termsText,
      social_links: socialLinks,
      updated_at: new Date().toISOString()
    });
  };

  return (
    <footer className="bg-background border-t py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">About MPA</h3>
            {isEditing ? (
              <Textarea 
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">{aboutText}</p>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Contact</h3>
            {isEditing ? (
              <Input 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact email"
              />
            ) : (
              <p className="text-muted-foreground">
                <Mail className="inline mr-2 h-4 w-4" />
                {contactEmail}
              </p>
            )}
            <div className="flex space-x-4 mt-4">
              {socialLinks.github && (
                <SafeLink href={socialLinks.github} className="text-muted-foreground hover:text-primary">
                  <Github className="h-5 w-5" />
                </SafeLink>
              )}
              {socialLinks.twitter && (
                <SafeLink href={socialLinks.twitter} className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </SafeLink>
              )}
              {socialLinks.instagram && (
                <SafeLink href={socialLinks.instagram} className="text-muted-foreground hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </SafeLink>
              )}
              {socialLinks.facebook && (
                <SafeLink href={socialLinks.facebook} className="text-muted-foreground hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </SafeLink>
              )}
            </div>
            {isEditing && (
              <div className="space-y-2 mt-4">
                <Input 
                  value={socialLinks.github || ''}
                  onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                  placeholder="GitHub URL"
                  className="mb-2"
                />
                <Input 
                  value={socialLinks.twitter || ''}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                  placeholder="Twitter URL"
                  className="mb-2"
                />
                <Input 
                  value={socialLinks.instagram || ''}
                  onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                  placeholder="Instagram URL"
                  className="mb-2"
                />
                <Input 
                  value={socialLinks.facebook || ''}
                  onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                  placeholder="Facebook URL"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Privacy Policy</h3>
            {isEditing ? (
              <Textarea 
                value={privacyText}
                onChange={(e) => setPrivacyText(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">{privacyText}</p>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Terms of Service</h3>
            {isEditing ? (
              <Textarea 
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">{termsText}</p>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <div className="mt-8 flex justify-end">
            {isEditing ? (
              <Button 
                onClick={handleSave} 
                className="flex items-center gap-2"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit Footer
              </Button>
            )}
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Multi Project Association. All rights reserved.</p>
          <p className="mt-1">
            <Link to="/terms" className="hover:text-primary">Terms</Link> · 
            <Link to="/privacy" className="hover:text-primary ml-2">Privacy</Link> · 
            <Link to="/cookies" className="hover:text-primary ml-2">Cookies</Link>
          </p>
          {showPoweredBy && (
            <div className="mt-4 text-xs font-semibold">
              Powered by <span className="text-primary">CGT</span>
            </div>
          )}
          <div className="mt-2 text-xs">
            <Link to="/report-error" className="text-primary hover:underline">Report an Issue</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
