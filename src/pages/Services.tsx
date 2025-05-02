
import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ServiceList } from "@/components/services/ServiceList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, PenTool, Film, Image, FileSpreadsheet, Package, Code, Search } from "lucide-react";

const ServiceCategoryIcons = {
  all: <Search className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  presentation: <PenTool className="h-4 w-4" />,
  spreadsheet: <FileSpreadsheet className="h-4 w-4" />,
  design: <Package className="h-4 w-4" />,
  photo: <Image className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />
};

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");

  return (
    <PageLayout
      title="Digital Services"
      description="Browse our range of professional digital services to help with your projects"
    >
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">MPA Digital Services</h1>
        <p className="text-muted-foreground text-lg">
          Professional digital services delivered by experts. From document creation to video editing, we've got you covered.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input 
            placeholder="Search services..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="delivery">Delivery Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-8">
          <TabsTrigger value="all" className="flex items-center gap-2">
            {ServiceCategoryIcons.all}
            <span className="hidden md:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            {ServiceCategoryIcons.document}
            <span className="hidden md:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="presentation" className="flex items-center gap-2">
            {ServiceCategoryIcons.presentation}
            <span className="hidden md:inline">Presentations</span>
          </TabsTrigger>
          <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
            {ServiceCategoryIcons.spreadsheet}
            <span className="hidden md:inline">Spreadsheets</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            {ServiceCategoryIcons.design}
            <span className="hidden md:inline">3D Design</span>
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex items-center gap-2">
            {ServiceCategoryIcons.photo}
            <span className="hidden md:inline">Photo Editing</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            {ServiceCategoryIcons.video}
            <span className="hidden md:inline">Video Editing</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            {ServiceCategoryIcons.code}
            <span className="hidden md:inline">Code</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ServiceList />
        </TabsContent>
        <TabsContent value="document">
          <ServiceList />
        </TabsContent>
        <TabsContent value="presentation">
          <ServiceList />
        </TabsContent>
        <TabsContent value="spreadsheet">
          <ServiceList />
        </TabsContent>
        <TabsContent value="design">
          <ServiceList />
        </TabsContent>
        <TabsContent value="photo">
          <ServiceList />
        </TabsContent>
        <TabsContent value="video">
          <ServiceList />
        </TabsContent>
        <TabsContent value="code">
          <ServiceList />
        </TabsContent>
      </Tabs>

      <div className="bg-muted/50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Need a Custom Service?</h2>
        <p className="text-muted-foreground mb-4">
          Don't see what you're looking for? We can create custom digital services tailored to your specific needs.
        </p>
        <ul className="list-disc pl-5 mb-4 text-muted-foreground">
          <li>Simply describe what you need</li>
          <li>Get a custom quote</li>
          <li>We'll deliver exactly what you require</li>
        </ul>
      </div>
    </PageLayout>
  );
};

export default Services;
