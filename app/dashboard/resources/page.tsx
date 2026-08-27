"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bookmark, BookmarkCheck, Calendar, Download, FileText, LayoutGrid, List, Search, User } from "lucide-react";
import Image from "next/image";

const resources: any[] = [];

const categories = [
  { name: "All", count: resources.length },
  { name: "Guides", count: 0 },
  { name: "Templates", count: 0 },
  { name: "Legal", count: 0 },
  { name: "Toolkit", count: 0 },
];

const allTags: string[] = [];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  // Filter resources based on active filters
  const filteredResources = resources.filter(resource => {
    // Category filter
    if (activeCategory !== "All" && resource.type !== activeCategory.slice(0, -1)) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tags filter
    if (activeTags.length > 0 && !resource.tags.some(tag => activeTags.includes(tag))) {
      return false;
    }
    
    return true;
  });
  
  // Toggle a tag in the active tags list
  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };
  
  // Featured resources section
  const featuredResources = resources.filter(resource => resource.featured);
  
  return (
    <div className="space-y-8">
      {/* Header with search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Resources Library</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search resources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Featured resources banner */}
      {!searchQuery && activeCategory === "All" && activeTags.length === 0 && (
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 dark:bg-gradient-to-r dark:from-blue-950 dark:to-violet-950">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative p-6 md:p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Featured Resources</h2>
            <p className="text-white/80 max-w-2xl mb-6">
              Essential materials to help your startup succeed in Ethiopia&apos;s growing 
              entrepreneurial ecosystem.
            </p>
            
            {/* Featured resources grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredResources.map((resource) => (
                <div key={resource.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 ${resource.bgColor} rounded-md`}>
                      {resource.icon}
                    </div>
                    <span className="text-white font-medium">{resource.title}</span>
                  </div>
                  <p className="text-white/80 text-sm mb-3">{resource.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-none">
                      {resource.type}
                    </Badge>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Filtering and view options */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between">
        <Tabs 
          defaultValue="All" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full md:w-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.name} value={category.name} className="flex items-center gap-1">
                {category.name}
                <Badge variant="outline" className="ml-1 bg-white">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`${bookmarkedOnly ? 'bg-amber-50 text-amber-900 border-amber-200' : ''}`}
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
          >
            {bookmarkedOnly ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
            {bookmarkedOnly ? 'Bookmarked' : 'Bookmarks'}
          </Button>
          
          <div className="border rounded-md flex">
            <Button 
              variant="ghost" 
              size="sm"
              className={`rounded-l-md rounded-r-none px-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`rounded-r-md rounded-l-none px-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tags filtering */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <Badge 
            key={tag} 
            variant={activeTags.includes(tag) ? "default" : "outline"} 
            className={`cursor-pointer ${activeTags.includes(tag) ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-100'}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
        
        {activeTags.length > 0 && (
          <Button variant="link" className="h-6 py-0 text-sm text-gray-500" onClick={() => setActiveTags([])}>
            Clear filters
          </Button>
        )}
      </div>
      
      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredResources.length} of {resources.length} resources
      </div>
      
      {/* Resource grid or list */}
      {viewMode === 'grid' ? (
        // Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className={`shadow-sm transition-all ${resource.bgHoverColor} overflow-hidden`}>
              <div className="relative h-40 bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                <div className={`absolute top-3 left-3 z-20 ${resource.bgColor} rounded-full px-3 py-1 text-xs font-medium ${resource.color}`}>
                  {resource.type}
                </div>
                <div className="absolute bottom-3 left-3 z-20 text-white text-sm flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{resource.dateAdded}</span>
                </div>
                <Image 
                  src={resource.image || "/resources/default.jpg"} 
                  alt={resource.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {resource.summary}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[120px]">{resource.author}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-500">{resource.pages} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-500">{resource.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full">Download Resource</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // List view
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className={`shadow-sm transition-all ${resource.bgHoverColor}`}>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 md:col-span-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 ${resource.bgColor} rounded-md`}>
                      {resource.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{resource.description}</p>
                    </div>
                    <Badge className={`ml-auto ${resource.lightBgColor} ${resource.color} border-none`}>
                      {resource.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {resource.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-gray-500">{resource.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-gray-500">{resource.dateAdded}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-gray-500">{resource.pages} pages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-gray-500">{resource.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l">
                  <Button className="w-full mb-2">Download</Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Bookmark className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
