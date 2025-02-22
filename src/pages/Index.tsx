
import { ArrowRight, Zap, Lock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/auth/AuthForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mx-auto w-full max-w-2xl text-center animate-fade-in">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to Your Site
          </h1>
          <p className="mb-12 text-lg text-muted-foreground sm:text-xl">
            A beautiful foundation for your next project
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-colors">
              <Zap className="h-8 w-8 mb-3 text-primary" />
              <h3 className="font-medium mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Built with modern tech for optimal performance</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-colors">
              <Lock className="h-8 w-8 mb-3 text-primary" />
              <h3 className="font-medium mb-2">Secure by Default</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade security out of the box</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-colors">
              <Palette className="h-8 w-8 mb-3 text-primary" />
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
