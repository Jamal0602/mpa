
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, PenTool, Film, Image, FileSpreadsheet, Package, Code, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SafeLink } from "@/utils/linkHandler";

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

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  estimatedDelivery: string;
  featured: boolean;
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

// Sample service data - will be replaced with Supabase data
const sampleServices: Service[] = [
  {
    id: "1",
    name: "Professional Word Document",
    description: "High-quality Word documents created to your specifications. Includes formatting, tables, and graphics.",
    category: "document",
    price: 50,
    estimatedDelivery: "2-3 days",
    featured: true
  },
  {
    id: "2",
    name: "Excel Data Analysis",
    description: "Complex spreadsheets with formulas, pivot tables, and data visualization.",
    category: "spreadsheet",
    price: 100,
    estimatedDelivery: "3-5 days",
    featured: true
  },
  {
    id: "3",
    name: "PowerPoint Presentation",
    description: "Engaging presentations with professional design, animations, and speaker notes.",
    category: "presentation",
    price: 150,
    estimatedDelivery: "3-4 days",
    featured: false
  },
  {
    id: "4",
    name: "Photo Editing",
    description: "Professional photo editing, retouching, and enhancement.",
    category: "photo",
    price: 75,
    estimatedDelivery: "1-2 days",
    featured: false
  },
  {
    id: "5",
    name: "Video Editing",
    description: "Professional video editing, color grading, and effects.",
    category: "video",
    price: 200,
    estimatedDelivery: "4-7 days",
    featured: true
  },
  {
    id: "6",
    name: "3D Design & Modeling",
    description: "Custom 3D models for various purposes including printing and digital use.",
    category: "design",
    price: 250,
    estimatedDelivery: "5-10 days",
    featured: false
  }
];

interface ServiceListProps {
  featured?: boolean;
}

export const ServiceList: React.FC<ServiceListProps> = ({ featured = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const displayedServices = featured 
    ? sampleServices.filter(service => service.featured) 
    : sampleServices;

  const handleOrderService = (serviceId: string) => {
    if (!user) {
      navigate('/auth?redirect=upload');
    } else {
      navigate(`/upload?service=${serviceId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedServices.map((service) => (
        <Card key={service.id} className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">{service.description}</CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                {getCategoryIcon(service.category)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="capitalize">
                {service.category}
              </Badge>
              <span className="text-lg font-semibold">{service.price} SP</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Delivery: {service.estimatedDelivery}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => handleOrderService(service.id)} 
              className="w-full"
            >
              Order Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
