
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/layout/PageLayout";
import { PositionsList } from "@/components/work-with-us/PositionsList";
import { JobApplicationForm } from "@/components/work-with-us/JobApplicationForm";

const WorkWithUs = () => {
  const { user } = useAuth();

  return (
    <PageLayout
      title="Work With Us"
      description="Join our team of skilled professionals and work on exciting projects"
      requireAuth={true}
    >
      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        <PositionsList />
        
        <div>
          {user && <JobApplicationForm userId={user.id} />}
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkWithUs;
