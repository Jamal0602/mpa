
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AdPlaceholderProps {
  type: "banner" | "sidebar" | "inline" | "leaderboard";
  className?: string;
  location?: string;
}

interface AdContent {
  id: string;
  content_url: string | null;
  content_html: string | null;
  content_type: string;
}

export function AdPlaceholder({ type, className, location }: AdPlaceholderProps) {
  const [adContent, setAdContent] = useState<AdContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Size mapping based on ad type
  const sizeMap = {
    banner: "h-[90px] w-full",
    sidebar: "h-[250px] w-[300px]",
    inline: "h-[280px] w-full",
    leaderboard: "h-[90px] w-[728px] max-w-full",
  };

  useEffect(() => {
    // Fetch appropriate ad content for this placeholder
    const fetchAdContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const query = supabase
          .from('advertising_content')
          .select(`
            id,
            content_url,
            content_html,
            content_type,
            slot_id,
            advertising_slots!inner(location)
          `)
          .eq('is_active', true);
          
        // Filter by location if provided
        if (location) {
          query.eq('advertising_slots.location', location);
        }
        
        const { data, error } = await query.limit(1);
        
        if (error) {
          console.error("Error fetching ad content:", error);
          setError("Failed to load advertisement");
          setIsLoading(false);
          return;
        }
        
        if (data && data.length > 0) {
          setAdContent({
            id: data[0].id,
            content_url: data[0].content_url,
            content_html: data[0].content_html,
            content_type: data[0].content_type
          });
        } else {
          // No specific ad found, use default AdSense
          setAdContent(null);
        }
      } catch (e) {
        console.error("AdSense error:", e);
        setError("Failed to load advertisement");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdContent();
  }, [location, type]);

  // Initialize AdSense when component mounts
  useEffect(() => {
    try {
      if ((window as any).adsbygoogle && document.querySelectorAll('.adsbygoogle').length) {
        (window as any).adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  const renderAdContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center w-full h-full animate-pulse">
          <div className="text-xs text-muted-foreground">Loading ad...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-xs text-muted-foreground">Ad unavailable</div>
        </div>
      );
    }

    if (!adContent) {
      // Render default AdSense
      return (
        <ins 
          className="adsbygoogle" 
          style={{display: "block", width: "100%", height: "100%"}}
          data-ad-client="ca-pub-7483780622360467"
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      );
    }

    // Render custom ad content
    if (adContent.content_type === 'image' && adContent.content_url) {
      return (
        <a 
          href={adContent.content_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img 
            src={adContent.content_url} 
            alt="Advertisement" 
            className="w-full h-full object-cover"
          />
        </a>
      );
    } else if (adContent.content_type === 'html' && adContent.content_html) {
      return (
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: adContent.content_html }} 
        />
      );
    }

    // Fallback
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-xs text-muted-foreground">Advertisement</div>
      </div>
    );
  };

  return (
    <div className={cn(
      "mx-auto my-4 overflow-hidden bg-background/50 rounded-md border flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity", 
      sizeMap[type], 
      className
    )}>
      {renderAdContent()}
    </div>
  );
}
