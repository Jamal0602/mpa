
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, PenTool, Film, Image, FileSpreadsheet, Package, Code, Search, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SafeLink } from "@/utils/linkHandler";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from "@/components/ui/loading";

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

// Service interface to match the database schema
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
  category?: ServiceCategory; // We'll add this for UI display
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

interface ServiceListProps {
  featured?: boolean;
  category?: string;
  searchTerm?: string;
  sortOrder?: string;
}

export const ServiceList: React.FC<ServiceListProps> = ({ 
  featured = false, 
  category = 'all',
  searchTerm = '',
  sortOrder = 'featured'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch services from the database
  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services', featured, category, searchTerm, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('MPA_service_offers')
        .select('*')
        .eq('is_active', true);
      
      // Apply sorting
      if (sortOrder === 'price_low') {
        query = query.order('point_cost', { ascending: true });
      } else if (sortOrder === 'price_high') {
        query = query.order('point_cost', { ascending: false });
      } else if (sortOrder === 'delivery') {
        query = query.order('name', { ascending: true }); // Replace with actual delivery time field if available
      } else {
        // Default to featured sorting
        query = query.order('discount_percentage', { ascending: false }).order('point_cost', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database results to service objects with categories
      const servicesWithCategories = data.map(service => ({
        ...service,
        category: mapServiceToCategory(service.name)
      }));
      
      // Filter by category if needed
      let filteredServices = servicesWithCategories;
      if (category !== 'all') {
        filteredServices = servicesWithCategories.filter(service => service.category === category);
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredServices = filteredServices.filter(
          service => 
            service.name.toLowerCase().includes(term) || 
            (service.description && service.description.toLowerCase().includes(term))
        );
      }
      
      // Filter by featured if requested
      if (featured) {
        filteredServices = filteredServices.filter(service => service.discount_percentage && service.discount_percentage > 0);
      }

      return filteredServices;
    }
  });

  const handleOrderService = (serviceId: string) => {
    if (!user) {
      navigate('/auth?redirect=upload');
    } else {
      navigate(`/upload?service=${serviceId}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-lg font-medium">Failed to load services</h3>
        <p className="text-muted-foreground mt-1">Please try again later</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No services found</h3>
        <p className="text-muted-foreground mt-1">
          {searchTerm ? 'Try a different search term' : 'Check back soon for new services'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
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
              <span className="text-lg font-semibold">{service.point_cost} SP{service.per_page_pricing ? '/page' : ''}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {service.end_date ? (
                <>Offer ends: {new Date(service.end_date).toLocaleDateString()}</>
              ) : (
                "Always available"
              )}
            </div>
            {service.discount_percentage && service.discount_percentage > 0 && (
              <Badge variant="destructive" className="mt-2">
                {service.discount_percentage}% OFF
              </Badge>
            )}
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
