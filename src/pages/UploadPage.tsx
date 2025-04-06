import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LoadingPage } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/PageLayout";
import { UploadForm } from "@/components/upload/UploadForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Download, 
  ShoppingCart, 
  PenBox,
  Clock,
  ArrowRightIcon,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ServiceOffer {
  id: string;
  name: string;
  description: string;
  point_cost: number;
  discount_percentage: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  per_page_pricing: boolean;
}

const UploadPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<ServiceOffer | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'upload' | 'confirm'>('select');
  const [pageCount, setPageCount] = useState(1);
  const UPLOAD_COST = 5;
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["profile-points", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("key_points")
        .eq("id", user.id)
        .single();
        
      if (error) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Consider data fresh for 1 minute
  });
  
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["service-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_offers")
        .select("*")
        .eq("is_active", true)
        .order("point_cost", { ascending: true });
        
      if (error) {
        toast({
          title: "Error fetching services",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data as ServiceOffer[];
    },
    staleTime: 300000, // 5 minutes
  });
  
  const handlePurchaseClick = (service: ServiceOffer) => {
    setSelectedService(service);
    setCurrentStep('select');
    setPurchaseDialogOpen(true);
  };

  const getTotalCost = () => {
    if (!selectedService) return 0;
    
    if (selectedService.per_page_pricing) {
      return selectedService.point_cost * pageCount;
    }
    
    return selectedService.point_cost;
  };
  
  const handlePurchaseConfirm = async () => {
    if (!user || !selectedService) return;
    
    try {
      const totalCost = getTotalCost();
      
      // Check if user has enough points
      if ((profile?.key_points || 0) < totalCost) {
        toast({
          title: "Insufficient Spark Points",
          description: "You don't have enough Spark Points to purchase this service.",
          variant: "destructive"
        });
        return;
      }
      
      // Create transaction and reduce points
      const { error: transactionError } = await supabase.rpc('decrement_points', {
        user_id: user.id,
        amount_to_deduct: totalCost
      });
      
      if (transactionError) throw transactionError;
      
      // Record the transaction
      const { error: keyPointsError } = await supabase
        .from("key_points_transactions")
        .insert({
          user_id: user.id,
          amount: -totalCost,
          description: `Purchased service: ${selectedService.name}${selectedService.per_page_pricing ? ` (${pageCount} pages)` : ''}`,
          transaction_type: 'spend'
        });
      
      if (keyPointsError) throw keyPointsError;
      
      // Create a new project record for the purchased service
      const { error: projectError } = await supabase
        .from("projects")
        .insert({
          title: `Service: ${selectedService.name}`,
          description: selectedService.description,
          user_id: user.id,
          category: "service",
          type: "purchased",
          status: "pending",
          file_format: "service",
          page_count: selectedService.per_page_pricing ? pageCount : 1
        });
        
      if (projectError) throw projectError;
      
      toast({
        title: "Service purchased successfully",
        description: `You've purchased ${selectedService.name} for ${totalCost} Spark Points.`,
        variant: "default"
      });
      
      // Update user's points
      refetchProfile();
      setPurchaseDialogOpen(false);
      setCurrentStep('select');
      setPageCount(1);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://forms.app/static/embed.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  if (profileLoading || servicesLoading) return <LoadingPage />;
  
  return (
    <PageLayout 
      title="Services Marketplace"
      description="Browse and purchase services with your Spark Points"
      requireAuth={true}
      className="max-w-6xl"
    >
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="form">Request Custom Service</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <div className="mb-6">
            <Card className="bg-muted/40">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Your Spark Points</h3>
                    <p className="text-muted-foreground">Use your points to purchase services</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{profile?.key_points || 0}</div>
                      <div className="text-sm text-muted-foreground">Available Points</div>
                    </div>
                    <Link to="/subscription">
                      <Button variant="default">
                        Get More Points
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services && services.length > 0 ? (
              services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      {service.discount_percentage > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          -{service.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Fast delivery</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Quality assured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Full support</span>
                    </div>
                    {service.per_page_pricing && (
                      <div className="mt-4 text-sm text-amber-600 dark:text-amber-400 font-medium">
                        Pricing per page
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xl">
                        {service.point_cost} SP{service.per_page_pricing ? ' / page' : ''}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {service.end_date ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {new Date(service.end_date).toLocaleDateString()}
                          </div>
                        ) : "Always available"}
                      </div>
                    </div>
                    <Button 
                      className="w-full gap-2"
                      disabled={(profile?.key_points || 0) < service.point_cost}
                      onClick={() => handlePurchaseClick(service)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Purchase Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No services available</h3>
                <p className="text-muted-foreground mt-2">
                  Check back later for new services or request a custom service.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Request Custom Service</CardTitle>
              <CardDescription>
                Use this form to request a custom service from our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="formsappWrapper rounded-lg overflow-hidden bg-card"
                style={{ height: "800px" }}
              >
                <div
                  data-formapp-id="64fc5aa6b02x8ea4cc983520"
                  className="formsappIframe"
                ></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={purchaseDialogOpen} onOpenChange={(open) => {
        setPurchaseDialogOpen(open);
        if (!open) {
          setCurrentStep('select');
          setPageCount(1);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentStep === 'select' && "Service Details"}
              {currentStep === 'upload' && "Project Configuration"}
              {currentStep === 'confirm' && "Confirm Purchase"}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 'select' && "Review the service details before proceeding."}
              {currentStep === 'upload' && "Configure your project requirements."}
              {currentStep === 'confirm' && "Review your order details before confirming."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <>
              {currentStep === 'select' && (
                <div className="py-4 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">{selectedService.name}</span>
                    <span>{selectedService.point_cost} SP{selectedService.per_page_pricing ? ' / page' : ''}</span>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Service Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)} className="mr-2">
                      Cancel
                    </Button>
                    <Button onClick={() => setCurrentStep('upload')} className="gap-2">
                      Next Step <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep === 'upload' && (
                <div className="py-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Project Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedService.per_page_pricing && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Number of Pages</label>
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPageCount(Math.max(1, pageCount - 1))}
                              disabled={pageCount <= 1}
                            >-</Button>
                            <span className="mx-4 font-medium">{pageCount}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPageCount(pageCount + 1)}
                            >+</Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Total cost: {selectedService.point_cost * pageCount} SP
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <UploadForm 
                          userId={user.id} 
                          onUploadSuccess={refetchProfile}
                          userPoints={profile?.key_points || 0}
                          serviceMode={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('select')}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep('confirm')} className="gap-2">
                      Review Order <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep === 'confirm' && (
                <div className="py-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between py-1 border-b">
                          <span>Service:</span>
                          <span className="font-medium">{selectedService.name}</span>
                        </div>
                        
                        {selectedService.per_page_pricing && (
                          <div className="flex justify-between py-1 border-b">
                            <span>Pages:</span>
                            <span>{pageCount}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between py-1 border-b font-medium">
                          <span>Total Cost:</span>
                          <span>{getTotalCost()} SP</span>
                        </div>
                        
                        <div className="flex justify-between py-1 border-b">
                          <span>Your Balance After Purchase:</span>
                          <span className="font-medium">{(profile?.key_points || 0) - getTotalCost()} SP</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-6 text-sm text-muted-foreground">
                    By confirming, you agree to our terms of service for purchased items.
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                      Back
                    </Button>
                    <Button 
                      onClick={handlePurchaseConfirm}
                      disabled={(profile?.key_points || 0) < getTotalCost()}
                    >
                      Confirm Purchase
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default UploadPage;
