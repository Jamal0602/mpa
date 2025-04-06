
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

interface PositionsListProps {
  onApplyClick?: (position: string) => void;
}

export const PositionsList = ({ onApplyClick }: PositionsListProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from("job_positions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPositions(data || []);
      } catch (error: any) {
        console.error("Error fetching positions:", error);
        toast.error("Failed to load positions");
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();

    // Set up realtime subscription
    const channel = supabase
      .channel("job-positions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_positions" },
        (payload) => {
          fetchPositions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="py-10 text-center">Loading available positions...</div>;
  }

  if (positions.length === 0) {
    return (
      <div className="py-10 text-center">
        <p>No positions are currently available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {positions.map((position) => (
        <Card key={position.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{position.title}</CardTitle>
              <Badge variant={position.type === "Full-time" ? "default" : "secondary"}>
                {position.type}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-muted-foreground mt-2">
              <div className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                {position.department}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {position.location}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {new Date(position.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Job Description</h4>
              <p className="text-sm">{position.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Requirements</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {position.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full sm:w-auto ml-auto"
              onClick={() => onApplyClick && onApplyClick(position.title)}
            >
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
