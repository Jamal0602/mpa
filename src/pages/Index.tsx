
import { ArrowRight, Zap, Lock, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <div className="mx-auto w-full max-w-2xl text-center animate-fade-in">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-4 text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Launching Soon
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Your Next Project
          </h1>
          <p className="mb-12 text-lg text-muted-foreground sm:text-xl">
            A beautiful foundation with everything you need to start building amazing applications
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="group flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Zap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-medium mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Built with modern tech for optimal performance</p>
            </div>
            <div className="group flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Lock className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-medium mb-2">Secure by Default</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade security out of the box</p>
            </div>
            <div className="group flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Palette className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-medium mb-2">Beautiful Design</h3>
              <p className="text-sm text-muted-foreground">Elegant UI with dark mode support</p>
            </div>
          </div>
          <AuthForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
