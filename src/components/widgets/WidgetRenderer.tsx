
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Widget {
  id: string;
  title: string;
  description: string;
  type: string;
  code: string;
  settings: any;
  location: string;
  active: boolean;
  priority: number;
}

interface WidgetRendererProps {
  location: string;
}

export function WidgetRenderer({ location }: WidgetRendererProps) {
  const { data: widgets, isLoading } = useQuery({
    queryKey: ["widgets", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .eq("location", location)
        .eq("active", true)
        .order("priority", { ascending: true });
        
      if (error) throw error;
      return data as Widget[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!widgets || widgets.length === 0) {
    return null;
  }

  // Function to safely render the widget content
  const renderWidgetContent = (widget: Widget) => {
    try {
      switch (widget.type) {
        case "html":
          return (
            <div 
              dangerouslySetInnerHTML={{ __html: widget.code }} 
              className="widget-html-container"
            />
          );
        case "iframe":
          return (
            <iframe 
              src={widget.settings?.url || ""} 
              title={widget.title}
              className="w-full border-0"
              style={{ height: widget.settings?.height || "300px" }}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          );
        case "custom":
          // For future custom widget implementations
          return (
            <div className="p-4 text-center text-muted-foreground">
              Custom widget: {widget.title}
            </div>
          );
        default:
          return (
            <div className="p-4 text-center text-muted-foreground">
              Unknown widget type: {widget.type}
            </div>
          );
      }
    } catch (error) {
      console.error("Error rendering widget:", error);
      return (
        <div className="p-4 text-center text-destructive">
          Error rendering widget
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {widgets.map((widget) => (
        <Card key={widget.id}>
          <CardContent className="p-4">
            {renderWidgetContent(widget)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
