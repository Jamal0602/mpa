
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, PenTool, Film, Image, FileSpreadsheet, Package, Code, Search, Clock, FileCheck, Award, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";

// Service category types
type ServiceCategory = 
  | "document"
  | "presentation" 
  | "spreadsheet" 
  | "design" 
  | "photo" 
  | "video" 
  | "code" 
  | "other";

interface ServiceOffer {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
  discount_percentage: number | null;
  is_active: boolean | null;
  start_date: string | null;
  end_date: string | null;
  per_page_pricing: boolean | null;
  created_at: string;
  category?: ServiceCategory; // Added for UI display
  estimatedDelivery?: string; // For display purposes
  requirements?: string[];    // For display purposes
  benefits?: string[];        // For display purposes
}

// Get icon based on service category
const getCategoryIcon = (category: ServiceCategory) => {
  switch (category) {
    case "document":
      return <FileText className="h-6 w-6" />;
    case "presentation":
      return <PenTool className="h-6 w-6" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-6 w-6" />;
    case "design":
      return <Package className="h-6 w-6" />;
    case "photo":
      return <Image className="h-6 w-6" />;
    case "video":
      return <Film className="h-6 w-6" />;
    case "code":
      return <Code className="h-6 w-6" />;
    default:
      return <Search className="h-6 w-6" />;
  }
};

// Map service names to categories for display
const mapServiceToCategory = (serviceName: string): ServiceCategory => {
  const name = serviceName.toLowerCase();
  if (name.includes('document') || name.includes('word') || name.includes('pdf')) return 'document';
  if (name.includes('presentation') || name.includes('powerpoint') || name.includes('slide')) return 'presentation';
  if (name.includes('spreadsheet') || name.includes('excel') || name.includes('data')) return 'spreadsheet';
  if (name.includes('design') || name.includes('3d') || name.includes('model')) return 'design';
  if (name.includes('photo') || name.includes('image') || name.includes('picture')) return 'photo';
  if (name.includes('video') || name.includes('movie') || name.includes('editing')) return 'video';
  if (name.includes('code') || name.includes('programming') || name.includes('development')) return 'code';
  return 'other';
};

// Service-specific display properties based on category
const getServiceDisplayProps = (category: ServiceCategory) => {
  const deliveryTimes = {
    document: "2-3 days",
    presentation: "3-4 days",
    spreadsheet: "3-5 days",
    design: "5-10 days",
    photo: "1-2 days",
    video: "4-7 days",
    code: "3-7 days",
    other: "3-5 days"
  };

  const requirements = {
    document: [
      "Clear specifications of what you need",
      "Any specific formatting requirements",
      "Reference materials (if applicable)",
      "Target audience information"
    ],
    presentation: [
      "Content outline or key points",
      "Brand guidelines if available",
      "Example slides for reference (optional)",
      "Target audience information"
    ],
    spreadsheet: [
      "Raw data in any format",
      "Required calculations and formulas",
      "Expected output format",
      "Any specific visualization needs"
    ],
    design: [
      "Design brief with detailed requirements",
      "Reference images or models",
      "Intended use of the 3D model",
      "Preferred file format"
    ],
    photo: [
      "Original high-resolution photos",
      "Specific editing requirements",
      "Reference images (if available)",
      "Preferred style and tone"
    ],
    video: [
      "Raw video footage",
      "Audio files if separate",
      "Script or storyboard (if available)",
      "Style references and timeline requirements"
    ],
    code: [
      "Detailed project requirements",
      "Preferred programming language/framework",
      "Any existing codebase to integrate with",
      "Expected functionality and features"
    ],
    other: [
      "Detailed description of your requirements",
      "Reference materials",
      "Timeline expectations",
      "Any specific constraints or preferences"
    ]
  };

  const benefits = {
    document: [
      "Professional formatting and layout",
      "Error-free content and consistent styling",
      "APA, MLA, Chicago or custom formatting",
      "Tables, charts, and graphics as needed",
      "Multiple revisions included"
    ],
    presentation: [
      "Engaging and professional design",
      "Consistent branding throughout",
      "Custom animations and transitions",
      "Speaker notes included",
      "Multiple revisions included"
    ],
    spreadsheet: [
      "Custom formulas and functions",
      "Data visualization with charts and graphs",
      "Automated calculations",
      "Organized and structured layout",
      "Multiple revisions included"
    ],
    design: [
      "High-quality 3D models",
      "Multiple file formats provided",
      "Texturing and materials included",
      "Ready for print or digital use",
      "Multiple revisions included"
    ],
    photo: [
      "Professional color correction",
      "Retouching and enhancement",
      "Background removal/replacement",
      "Multiple output formats and sizes",
      "Multiple revisions included"
    ],
    video: [
      "Professional editing and color grading",
      "Custom transitions and effects",
      "Background music and sound effects",
      "Title and credits included",
      "Multiple revisions included"
    ],
    code: [
      "Clean, well-documented code",
      "Cross-platform compatibility",
      "Responsive design for web projects",
      "Performance optimization",
      "Multiple revisions included"
    ],
    other: [
      "Customized to your exact requirements",
      "Professional quality output",
      "Regular updates on progress",
      "Delivered in your preferred format",
      "Multiple revisions included"
    ]
  };

  return {
    estimatedDelivery: deliveryTimes[category],
    requirements: requirements[category],
    benefits: benefits[category]
  };
};

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<ServiceOffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchService = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('MPA_service_offers')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();
        
        if (error || !data) {
          console.error("Error fetching service:", error);
          setError(true);
          setLoading(false);
          return;
        }
        
        // Add category and display properties
        const category = mapServiceToCategory(data.name);
        const displayProps = getServiceDisplayProps(category);
        
        setService({
          ...data,
          category,
          ...displayProps
        });
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(true);
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);
  
  const handleOrderService = () => {
    if (!user) {
      navigate('/auth?redirect=upload');
      toast.info("Please log in to order services");
    } else if (service) {
      navigate(`/upload?service=${service.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !service) {
    return (
      <div className="container max-w-4xl px-4 py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <p className="mb-6">The service you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/services')}>View All Services</Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl px-4 py-8">
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{service.name}</CardTitle>
              <CardDescription className="text-lg mt-2">{service.description}</CardDescription>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              {getCategoryIcon(service.category)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center">
              <Badge variant="secondary" className="capitalize text-base py-1.5 px-2.5">
                {service.category}
              </Badge>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>Delivery: {service.estimatedDelivery}</span>
            </div>
            <div className="flex items-center justify-end md:justify-start">
              <span className="text-2xl font-bold">{service.point_cost} SP
                {service.per_page_pricing && <span className="text-sm font-normal">/page</span>}
              </span>
              {service.discount_percentage && service.discount_percentage > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {service.discount_percentage}% OFF
                </Badge>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-primary" />
              Service Description
            </h3>
            <p className="text-muted-foreground">{service.description || `Professional ${service.category} service tailored to your specific needs and requirements.`}</p>
          </div>
          
          {service.requirements && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-primary" />
                What We Need From You
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {service.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {service.benefits && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                What You'll Get
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {service.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between bg-muted/20 pt-4">
          <Button variant="outline" onClick={() => navigate('/services')}>
            Back to Services
          </Button>
          <Button onClick={handleOrderService}>
            Order This Service
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ServiceDetails;
