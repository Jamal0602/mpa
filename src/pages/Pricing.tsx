
import Navbar from "@/components/layout/Navbar";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "$9",
      description: "Perfect for getting started",
      features: [
        "Up to 5 projects",
        "Basic analytics",
        "24/7 support",
        "1GB storage",
      ],
    },
    {
      name: "Pro",
      price: "$29",
      description: "Best for professionals",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "10GB storage",
        "Custom domain",
        "API access",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "24/7 phone support",
        "Unlimited storage",
        "Custom integrations",
        "SLA",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg">
            Choose the plan that's right for you
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg border ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "bg-card"
              } p-6 flex flex-col`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
