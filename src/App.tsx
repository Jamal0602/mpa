
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
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

// Create a client
const queryClient = new QueryClient();

// Layout component that wraps our pages with common elements
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route 
                path="/" 
                element={
                  <MainLayout>
                    <Index />
                  </MainLayout>
                } 
              />
              <Route 
                path="/features" 
                element={
                  <MainLayout>
                    <Features />
                  </MainLayout>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                } 
              />
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route 
                path="/account" 
                element={
                  <MainLayout>
                    <AccountSettings />
                  </MainLayout>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <MainLayout>
                    <UploadPage />
                  </MainLayout>
                } 
              />
              <Route 
                path="/subscription" 
                element={
                  <MainLayout>
                    <Subscription />
                  </MainLayout>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <MainLayout>
                    <Help />
                  </MainLayout>
                } 
              />
              <Route 
                path="/work-with-us" 
                element={
                  <MainLayout>
                    <WorkWithUs />
                  </MainLayout>
                } 
              />
              <Route 
                path="/referral" 
                element={
                  <MainLayout>
                    <Referral />
                  </MainLayout>
                } 
              />
              <Route 
                path="/report-error" 
                element={
                  <MainLayout>
                    <ErrorReport />
                  </MainLayout>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
