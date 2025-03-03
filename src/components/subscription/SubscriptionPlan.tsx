
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export interface SubscriptionPlanType {
  id: string;
  name: string;
  price: number;
  points: number;
  bonus: number;
  features: string[];
  popular?: boolean;
}

interface SubscriptionPlanProps {
  plan: SubscriptionPlanType;
  isSelected: boolean;
  onSelect: (plan: SubscriptionPlanType) => void;
  disabled?: boolean;
}

export const SubscriptionPlan = ({ 
  plan, 
  isSelected, 
  onSelect,
  disabled = false 
}: SubscriptionPlanProps) => {
  return (
    <Card 
      className={`relative overflow-hidden transition-all ${
        isSelected 
          ? "border-primary" 
          : "hover:border-primary/40"
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-bold">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{plan.name}</span>
          {plan.bonus > 0 && (
            <Badge variant="secondary" className="ml-auto">
              +{plan.bonus} Bonus
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {plan.points + plan.bonus} Spark Points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-5">
          ₹{plan.price}
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onSelect(plan)}
          variant={isSelected ? "default" : "outline"}
          disabled={disabled}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
};
