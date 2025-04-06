
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/layout/PageLayout";
import { PositionsList } from "@/components/work-with-us/PositionsList";
import { JobApplicationForm } from "@/components/work-with-us/JobApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Users, MapPin, Building } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WorkWithUs = () => {
  const { user } = useAuth();
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const handleApplyClick = (position: string) => {
    setSelectedPosition(position);
    setIsApplicationDialogOpen(true);
  };

  return (
    <PageLayout
      title="Work With Us"
      description="Join our team of skilled professionals and work on exciting projects"
      requireAuth={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join a diverse team of professionals passionate about innovation and excellence
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Discover exciting opportunities for career growth and professional development
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-violet-600" />
              Our Culture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Experience a culture that values collaboration, creativity, and continuous learning
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-6" />

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Available Positions
            </CardTitle>
            <CardDescription>
              Browse our current job openings and find the perfect role for your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <PositionsList onApplyClick={handleApplyClick} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Apply for {selectedPosition || "Position"}</DialogTitle>
            <DialogDescription>
              Complete the application form below to apply for this position
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {user ? (
              <JobApplicationForm 
                userId={user.id} 
                position={selectedPosition || ""} 
                onSubmitSuccess={() => setIsApplicationDialogOpen(false)}
              />
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Please log in to submit your application
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default WorkWithUs;
