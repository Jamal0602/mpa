
import { FC } from 'react';
import ServiceDetails from '@/components/services/ServiceDetails';
import { PageLayout } from '@/components/layout/PageLayout';

const ServiceDetailsPage: FC = () => {
  return (
    <PageLayout 
      title="Service Details" 
      description="View details and pricing for this service"
    >
      <ServiceDetails />
    </PageLayout>
  );
};

export default ServiceDetailsPage;
