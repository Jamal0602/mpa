
import { useState } from "react";
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

function App() {
  return (
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
