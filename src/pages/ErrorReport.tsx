
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorReportForm } from '@/components/error-report/ErrorReportForm';
import { PaymentIssueForm } from '@/components/error-report/PaymentIssueForm';
import { LimitReachedDisplay } from '@/components/error-report/LimitReachedDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PageLayout } from '@/components/layout/PageLayout';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ErrorReport() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'bug' | 'payment'>('bug');
  
  const { data: reportCount, isLoading } = useQuery({
    queryKey: ['user-daily-reports', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase.rpc('user_daily_error_reports', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error fetching report count:', error);
        return 0;
      }
      
      return data as number;
    },
    enabled: !!user,
  });
  
  const MAX_DAILY_REPORTS = 3;
  const hasReachedLimit = reportCount !== undefined && reportCount >= MAX_DAILY_REPORTS;
  
  const handleReportSuccess = () => {
    // Force a refetch of the report count
    supabase.rpc('user_daily_error_reports', { user_id: user?.id });
  };
  
  return (
    <PageLayout title="Report an Issue" description="Help us improve by reporting issues or errors">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hasReachedLimit ? (
        <LimitReachedDisplay maxReports={MAX_DAILY_REPORTS} />
      ) : (
        <div className="container mx-auto py-6">
          <Tabs defaultValue={reportType} className="w-full" onValueChange={(value) => setReportType(value as 'bug' | 'payment')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="bug">Bug Report</TabsTrigger>
              <TabsTrigger value="payment">Payment Issue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bug" className="pt-2">
              <ErrorReportForm onSuccess={handleReportSuccess} />
            </TabsContent>
            
            <TabsContent value="payment" className="pt-2">
              <PaymentIssueForm onSuccess={handleReportSuccess} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              You have used {reportCount} of {MAX_DAILY_REPORTS} available reports for today
            </p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
