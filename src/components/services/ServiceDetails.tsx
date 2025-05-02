import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, PenTool, Film, Image, FileSpreadsheet, Package, Code, Search, Clock, FileCheck, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

// Reusing service types from ServiceList
type ServiceCategory = 
  | "document"
  | "presentation" 
  | "spreadsheet" 
  | "design" 
  | "photo" 
  | "video" 
  | "code" 
  | "other";

interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  estimatedDelivery: string;
  featured: boolean;
  detailedDescription?: string;
  requirements?: string[];
  benefits?: string[];
}

// Extended sample data with more details
const serviceDetails: Record<string, Service> = {
  "1": {
    id: "1",
    name: "Professional Word Document",
    description: "High-quality Word documents created to your specifications. Includes formatting, tables, and graphics.",
    category: "document",
    price: 50,
    estimatedDelivery: "2-3 days",
    featured: true,
    detailedDescription: "Our professional document creation service delivers high-quality, well-formatted documents tailored to your specific requirements. Whether you need a business report, academic paper, resume, or any other document type, our experts will ensure it meets the highest standards.",
    requirements: [
      "Clear specifications of what you need",
      "Any specific formatting requirements",
      "Reference materials (if applicable)",
      "Target audience information"
    ],
    benefits: [
      "Professional formatting and layout",
      "Error-free content and consistent styling",
      "APA, MLA, Chicago or custom formatting",
      "Tables, charts, and graphics as needed",
      "Multiple revisions included"
    ]
  },
  // Other services would be defined here
};

// Get icon based on service category (reused from ServiceList)
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

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // In a real app, fetch from Supabase
  const service = id ? serviceDetails[id] : null;
  
  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
        <p className="mb-6">The service you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/services')}>View All Services</Button>
      </div>
    );
  }
  
  const handleOrderService = () => {
    if (!user) {
      navigate('/auth?redirect=upload');
    } else {
      navigate(`/upload?service=${service.id}`);
    }
  };
  
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
              <span className="text-2xl font-bold">{service.price} SP</span>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-primary" />
              Service Description
            </h3>
            <p className="text-muted-foreground">{service.detailedDescription}</p>
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
