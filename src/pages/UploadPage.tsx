
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LoadingPage } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/PageLayout";
import { UploadForm } from "@/components/upload/UploadForm";
import { UploadSidebar } from "@/components/upload/UploadSidebar";
import { ServicePricing } from "@/components/upload/ServicePricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const UploadPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const UPLOAD_COST = 5;
  
  const { data: profile, isLoading, refetch: refetchProfile } = useQuery({
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
  
  if (isLoading) return <LoadingPage />;
  
  return (
    <PageLayout 
      title="Upload Your Project"
      description="Share your ideas and projects with the community"
      requireAuth={true}
      className="max-w-4xl"
    >
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="upload">Direct Upload</TabsTrigger>
          <TabsTrigger value="form">Form Submission</TabsTrigger>
          <TabsTrigger value="services">Service Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user && (
              <UploadForm 
                userId={user.id} 
                userPoints={profile?.key_points || 0}
                onSuccess={refetchProfile}
              />
            )}
            
            <UploadSidebar 
              userPoints={profile?.key_points || 0}
              uploadCost={UPLOAD_COST}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Project Submission Form</CardTitle>
              <CardDescription>
                Use this embedded form to submit your project details
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
        
        <TabsContent value="services">
          <ServicePricing />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default UploadPage;
