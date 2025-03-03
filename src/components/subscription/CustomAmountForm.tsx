
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, TrendingUp } from "lucide-react";

interface CustomAmountFormProps {
  value: number | "";
  onChange: (value: number | "") => void;
  onPlanSelected: () => void;
}

export const CustomAmountForm = ({ value, onChange, onPlanSelected }: CustomAmountFormProps) => {
  
  const calculateCustomPoints = (amount: number) => {
    if (amount >= 1000) return Math.floor(amount * 1.05);  // 5% bonus for 1000+
    else if (amount >= 500) return Math.floor(amount * 1.04);  // 4% bonus for 500+
    else if (amount >= 100) return Math.floor(amount * 1.03);  // 3% bonus for 100+
    else return amount;  // No bonus for smaller amounts
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? "" : Number(e.target.value);
    onChange(newValue);
    onPlanSelected();
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="custom-amount">Enter Amount (₹)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
          <Input
            id="custom-amount"
            type="number"
            min="1"
            className="pl-6"
            value={value}
            onChange={handleChange}
            placeholder="Enter custom amount"
          />
        </div>
      </div>
      <div className="flex-1 bg-primary/5 p-4 rounded-md">
        <div className="text-sm text-muted-foreground mb-2">You'll receive:</div>
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          <span className="text-xl font-bold">
            {value 
              ? `${calculateCustomPoints(Number(value))} Spark Points` 
              : "0 Spark Points"}
          </span>
        </div>
        {value && Number(value) >= 100 && (
          <div className="mt-2 text-xs text-primary flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Includes bonus points!
          </div>
        )}
      </div>
    </div>
  );
};
