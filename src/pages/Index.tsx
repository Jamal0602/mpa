
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content area - Posts */}
          <div className="md:col-span-8 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Latest Posts</h2>
              {/* Sample post cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-md border bg-background/50">
                  <h3 className="font-medium mb-2">Welcome to our platform</h3>
                  <p className="text-muted-foreground text-sm">
                    Get started with our new features and discover what's new...
                  </p>
                </div>
                <div className="p-4 rounded-md border bg-background/50">
                  <h3 className="font-medium mb-2">Tips for getting started</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn how to make the most of our platform with these helpful tips...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Widgets */}
          <div className="md:col-span-4 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-medium">567</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded-md bg-background/50">
                  <p className="text-muted-foreground">New feature added: Dark mode</p>
                </div>
                <div className="p-2 rounded-md bg-background/50">
                  <p className="text-muted-foreground">Performance improvements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
