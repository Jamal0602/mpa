
import React from 'react';
import { Check } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Authentication",
      description: "Secure user authentication and authorization system",
    },
    {
      title: "Real-time Updates",
      description: "Instant updates and notifications for better engagement",
    },
    {
      title: "Dark Mode",
      description: "Built-in dark mode support for better visibility",
    },
    {
      title: "Responsive Design",
      description: "Fully responsive layout that works on all devices",
    },
    {
      title: "Custom Widgets",
      description: "Customizable widgets for enhanced user experience",
    },
    {
      title: "Analytics",
      description: "Built-in analytics to track user engagement",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Platform Features</h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to build amazing applications
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
            </div>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
