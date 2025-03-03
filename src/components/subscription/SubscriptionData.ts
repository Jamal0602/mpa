
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  points: number;
  bonus: number;
  features: string[];
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 100,
    points: 100,
    bonus: 5,
    features: [
      "105 Spark Points",
      "Standard usage limits",
      "Email support"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: 500,
    points: 500,
    bonus: 20,
    popular: true,
    features: [
      "520 Spark Points",
      "Increased usage limits",
      "Priority email support",
      "Access to premium projects"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 1000,
    points: 1000,
    bonus: 50,
    features: [
      "1050 Spark Points",
      "Unlimited usage",
      "Priority support",
      "Access to premium projects",
      "Early access to new features"
    ]
  }
];

export const calculateCustomPoints = (amount: number) => {
  if (amount >= 1000) return Math.floor(amount * 1.05);  // 5% bonus for 1000+
  else if (amount >= 500) return Math.floor(amount * 1.04);  // 4% bonus for 500+
  else if (amount >= 100) return Math.floor(amount * 1.03);  // 3% bonus for 100+
  else return amount;  // No bonus for smaller amounts
};
