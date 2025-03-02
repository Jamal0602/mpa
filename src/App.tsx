
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Dashboard from "@/pages/Dashboard";
import AuthCallback from "@/components/auth/AuthCallback";
import AuthForm from "@/components/auth/AuthForm";
import NotFound from "@/pages/NotFound";
import AccountSettings from "@/pages/AccountSettings";
import UploadPage from "@/pages/UploadPage";
import Subscription from "@/pages/Subscription";
import Help from "@/pages/Help";
import WorkWithUs from "@/pages/WorkWithUs";
import Referral from "@/pages/Referral";
import ErrorReport from "@/pages/ErrorReport";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/help" element={<Help />} />
          <Route path="/work-with-us" element={<WorkWithUs />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/report-error" element={<ErrorReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
