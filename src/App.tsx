
import { Routes, Route, useLocation } from "react-router-dom";
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
import Blog from "@/pages/Blog";
import PostDetail from "@/pages/PostDetail";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { useEffect } from "react";
import AdminPanel from "@/pages/AdminPanel";
import AdminDashboard from "@/pages/AdminDashboard";
import { PageLayout } from "@/components/layout/PageLayout";
import { AnimatePresence, motion } from "framer-motion";
import LoadingRoute from "@/components/layout/LoadingRoute";
import { FloatingTab } from "@/components/ui/floating-tab";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import PasswordResetCallback from "@/components/auth/PasswordResetCallback";
import { ConstructionWrapper } from "@/components/layout/ConstructionWrapper";
import ChatHelp from "@/pages/ChatHelp";
import Services from "@/pages/Services";
import ServiceDetailsPage from "@/pages/Services/[id]";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
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
      <motion.main
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="container mx-auto px-4 py-8 flex-grow"
      >
        {children}
      </motion.main>
      <FloatingTab />
      <Footer showPoweredBy={true} />
    </div>
  );
};

function App() {
  const location = useLocation();
  
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <ConstructionWrapper>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
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
                    path="/blog" 
                    element={
                      <MainLayout>
                        <Blog />
                      </MainLayout>
                    } 
                  />
                  <Route 
                    path="/post/:id" 
                    element={
                      <MainLayout>
                        <PostDetail />
                      </MainLayout>
                    } 
                  />
                  <Route 
                    path="/auth" 
                    element={
                      <AuthForm />
                    } 
                  />
                  <Route 
                    path="/auth/callback" 
                    element={
                      <AuthCallback />
                    } 
                  />
                  <Route 
                    path="/auth/reset" 
                    element={
                      <PasswordResetForm />
                    } 
                  />
                  <Route 
                    path="/auth/reset-callback" 
                    element={
                      <PasswordResetCallback />
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <MainLayout>
                        <ChatHelp />
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
                  <Route 
                    path="/admin-dashboard" 
                    element={
                      <MainLayout>
                        <AdminDashboard />
                      </MainLayout>
                    } 
                  />
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
                    path="/services" 
                    element={
                      <MainLayout>
                        <Services />
                      </MainLayout>
                    } 
                  />
                  <Route 
                    path="/services/:id" 
                    element={
                      <MainLayout>
                        <ServiceDetailsPage />
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
                  <Route 
                    path="/loading" 
                    element={
                      <LoadingRoute message="Please wait..." showPoweredBy={true} />
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
              <Toaster />
            </ConstructionWrapper>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default App;
