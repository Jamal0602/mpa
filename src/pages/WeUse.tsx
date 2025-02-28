
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check } from "lucide-react";

interface ToolCard {
  name: string;
  description: string;
  category: string;
  features: string[];
  status: "core" | "experimental" | "deprecated";
}

const toolsData: ToolCard[] = [
  {
    name: "React",
    description: "A JavaScript library for building user interfaces",
    category: "Frontend",
    features: ["Component-Based", "Virtual DOM", "One-way Data Binding"],
    status: "core",
  },
  {
    name: "TypeScript",
    description: "TypeScript is JavaScript with syntax for types",
    category: "Language",
    features: ["Static Type-Checking", "IDE Support", "ECMAScript Features"],
    status: "core",
  },
  {
    name: "Tailwind CSS",
    description: "A utility-first CSS framework for rapidly building custom user interfaces",
    category: "Styling",
    features: ["Utility-First", "Responsive Design", "Dark Mode"],
    status: "core",
  },
  {
    name: "Supabase",
    description: "The open source Firebase alternative",
    category: "Backend",
    features: ["PostgreSQL Database", "Authentication", "Storage"],
    status: "core",
  },
  {
    name: "Shadcn/UI",
    description: "Beautifully designed components built with Radix UI and Tailwind CSS",
    category: "UI Components",
    features: ["Accessible", "Customizable", "Themeable"],
    status: "core",
  },
  {
    name: "Recharts",
    description: "A composable charting library built on React components",
    category: "Data Visualization",
    features: ["Responsive", "Customizable", "Diverse Chart Types"],
    status: "core",
  },
  {
    name: "Lucide Icons",
    description: "Beautiful & consistent icon toolkit made by the community",
    category: "UI Components",
    features: ["SVG Based", "Customizable", "Extensive Collection"],
    status: "core",
  },
  {
    name: "React Query",
    description: "Hooks for fetching, caching and updating asynchronous data in React",
    category: "Data Management",
    features: ["Caching", "Background Fetching", "Window Focus Refetching"],
    status: "core",
  },
  {
    name: "Vite",
    description: "Next Generation Frontend Tooling",
    category: "Build Tool",
    features: ["Hot Module Replacement", "Fast Builds", "Optimized Bundles"],
    status: "core",
  },
];

const certifications = [
  "ISO 27001:2013 Information Security",
  "GDPR Compliance",
  "WCAG 2.1 Level AA Accessibility",
  "SOC 2 Type II Compliance",
];

const partners = [
  "Google Cloud Platform",
  "Microsoft Azure",
  "Amazon Web Services",
  "Digital Ocean",
  "Stripe",
  "PayPal",
];

const WeUse = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "core":
        return "default";
      case "experimental":
        return "secondary";
      case "deprecated":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Technologies We Use</h1>
            <p className="text-xl text-muted-foreground">
              The tools and technologies that power our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsData.map((tool, index) => (
              <Card key={index} className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{tool.name}</CardTitle>
                    <Badge variant={getStatusColor(tool.status) as any}>
                      {tool.status}
                    </Badge>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                  <Badge variant="outline" className="mt-2">
                    {tool.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>Standards we adhere to</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partners</CardTitle>
                <CardDescription>Organizations we work with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {partners.map((partner, idx) => (
                    <Badge key={idx} variant="outline">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                Open Source Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are committed to using and contributing to open source software. Many of our
                internal tools and libraries are open sourced under permissive licenses, and we
                actively contribute to the projects we depend on.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeUse;
