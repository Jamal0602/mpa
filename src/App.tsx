
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
import Analytics from "@/pages/Analytics";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import AdminPanel from "@/pages/AdminPanel";
import { PageLayout } from "@/components/layout/PageLayout";

// Create a client
const queryClient = new QueryClient();

// Layout component that wraps our pages with common elements
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  // Google Tag Manager script setup
  useEffect(() => {
    // Initialize dataLayer for GTM
    window.dataLayer = window.dataLayer || [];
    
    // AdSense setup
    const adsenseScript = document.createElement('script');
    adsenseScript.async = true;
    adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7483780622360467';
    adsenseScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsenseScript);

    return () => {
      if (document.head.contains(adsenseScript)) {
        document.head.removeChild(adsenseScript);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
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
              <Route 
                path="/admin" 
                element={
                  <MainLayout>
                    <PageLayout requireAuth={true} title="Admin Panel">
                      <AdminPanel />
                    </PageLayout>
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
              <Route 
                path="/analytics" 
                element={
                  <MainLayout>
                    <Analytics />
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

// Add type definitions for global dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default App;
