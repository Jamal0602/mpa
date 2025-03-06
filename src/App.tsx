
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

import { PageLayout } from '@/components/layout/PageLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Features from '@/pages/Features';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import WeUse from '@/pages/WeUse';
import WorkWithUs from '@/pages/WorkWithUs';
import NotFound from '@/pages/NotFound';
import CreatePost from '@/pages/CreatePost';
import ProjectPage from '@/pages/ProjectPage';
import PostDetail from '@/pages/PostDetail';
import UploadPage from '@/pages/UploadPage';
import Subscription from '@/pages/Subscription';
import Referral from '@/pages/Referral';
import Analytics from '@/pages/Analytics';
import Help from '@/pages/Help';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import AccountSettings from '@/pages/AccountSettings';
import ErrorReport from '@/pages/ErrorReport';
import AdminAnalytics from '@/pages/AdminAnalytics';

import AuthForm from '@/components/auth/AuthForm';
import AuthCallback from '@/components/auth/AuthCallback';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/" element={<PageLayout />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="features" element={<Features />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="we-use" element={<WeUse />} />
                  <Route path="work-with-us" element={<WorkWithUs />} />
                  <Route path="create-post" element={<CreatePost />} />
                  <Route path="project/:id" element={<ProjectPage />} />
                  <Route path="post/:id" element={<PostDetail />} />
                  <Route path="upload" element={<UploadPage />} />
                  <Route path="subscription" element={<Subscription />} />
                  <Route path="referral" element={<Referral />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="admin-analytics" element={<AdminAnalytics />} />
                  <Route path="help" element={<Help />} />
                  <Route path="employee" element={<EmployeeDashboard />} />
                  <Route path="account" element={<AccountSettings />} />
                  <Route path="error-report" element={<ErrorReport />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </Router>
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
