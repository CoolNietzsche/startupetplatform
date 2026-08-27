import React from 'react';
import { 
  FileText, 
  Download, 
  FileBox, 
  Play, 
  Database, 
  Package, 
  ExternalLink, 
  Filter,
  Search,
  PlusCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { RESOURCES } from '../../data';

interface ResourcesSectionProps {
  builderId: string;
}

export default function ResourcesSection({ builderId }: ResourcesSectionProps) {
  // Filter resources provided by this ecosystem builder
  const builderResources = RESOURCES.filter(resource => resource.provider === builderId);
  
  // Get appropriate icon based on resource type
  const getResourceIcon = (type: string, format: string) => {
    switch(type) {
      case 'Document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'Video':
        return <Play className="h-6 w-6 text-red-500" />;
      case 'Dataset':
        return <Database className="h-6 w-6 text-green-500" />;
      case 'Templates':
        return <FileBox className="h-6 w-6 text-purple-500" />;
      case 'Toolkit':
        return <Package className="h-6 w-6 text-amber-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };
  
  // Get badge color based on format
  const getFormatColor = (format: string) => {
    switch(format.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'excel':
      case 'xlsx':
      case 'csv':
        return 'bg-green-100 text-green-700';
      case 'mp4':
      case 'video':
        return 'bg-blue-100 text-blue-700';
      case 'zip':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resources & Materials</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Resource
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="w-full pl-8"
          />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Resource type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="template">Templates</SelectItem>
            <SelectItem value="dataset">Datasets</SelectItem>
            <SelectItem value="toolkit">Toolkits</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {builderResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileBox className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No resources found for this ecosystem builder</p>
            <Button className="mt-4" variant="outline">Add First Resource</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builderResources.map(resource => (
            <Card key={resource.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-0">
                <div className="p-4 flex">
                  <div className="bg-gray-50 h-12 w-12 rounded flex items-center justify-center mr-4 flex-shrink-0">
                    {getResourceIcon(resource.type, resource.format)}
                  </div>
                  <div>
                    <h3 className="font-medium">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                  </div>
                </div>
                
                <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-normal ${getFormatColor(resource.format)}`}
                  >
                    {resource.format}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Featured Resources */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Featured Resources From All Ecosystem Builders</h3>
        
        <div className="space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-6 h-full">
                <div className="bg-blue-50 flex items-center justify-center p-6 md:col-span-1">
                  <FileText className="h-10 w-10 text-blue-500" />
                </div>
                <div className="p-4 md:p-6 md:col-span-5">
                  <Badge className="mb-2">Featured Guide</Badge>
                  <h3 className="text-lg font-medium">Complete Guide to Startup Funding in Ethiopia</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comprehensive resource covering all aspects of raising capital in Ethiopia, from bootstrapping to Series A.
                  </p>
                  
                  <div className="flex items-center mt-4 gap-3">
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Badge variant="outline">45 pages</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="bg-green-50 h-12 w-12 rounded flex items-center justify-center mr-4 flex-shrink-0">
                    <Database className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ethiopian Startup Ecosystem Map 2025</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Interactive data visualization of the Ethiopian startup ecosystem
                    </p>
                    
                    <div className="flex items-center mt-3 gap-2">
                      <Button size="sm" variant="outline">View Dataset</Button>
                      <Badge variant="secondary" className="text-xs">CSV</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="bg-red-50 h-12 w-12 rounded flex items-center justify-center mr-4 flex-shrink-0">
                    <Play className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Funding Pitches Masterclass</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Video series on crafting the perfect pitch for investors
                    </p>
                    
                    <div className="flex items-center mt-3 gap-2">
                      <Button size="sm" variant="outline">Watch Series</Button>
                      <Badge variant="secondary" className="text-xs">5 Videos</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
