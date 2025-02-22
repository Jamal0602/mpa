
import { ArrowRight } from "lucide-react";
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
            A beautiful foundation for your next project. Start adding features and watch it grow.
          </p>
          <AuthForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
