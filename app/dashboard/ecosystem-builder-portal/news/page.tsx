"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, SearchIcon, Filter, Calendar, MoreHorizontal, Edit, Trash2, Eye, BookOpen, ThumbsUp, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function NewsManagement() {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ecosystem-builder/news");
      const result = await res.json();
      if (result.success) {
        setNewsItems(result.data);
      } else {
        toast.error(result.error || "Failed to fetch news");
      }
    } catch (error) {
      toast.error("An error occurred while fetching news");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/ecosystem-builder/news/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Article deleted successfully");
        fetchNews();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/ecosystem-builder/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: true }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Article published successfully");
        fetchNews();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to publish article");
    }
  };

  // Helper functions for UI display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredItems = newsItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container px-4 py-6 lg:py-8">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground">
            Create and manage news articles and updates
          </p>
        </div>
        <Button asChild>
          <Link href="/ecosystem-builder/news">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Article
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Articles</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="all">
              <div className="grid gap-4">
                {filteredItems.map((article) => (
                  <NewsArticleCard 
                    key={article.id} 
                    article={article} 
                    onDelete={handleDelete}
                    onPublish={handlePublish}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-center py-12 text-muted-foreground">No articles found.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="published">
              <div className="grid gap-4">
                {filteredItems
                  .filter(article => article.status === "published")
                  .map((article) => (
                    <NewsArticleCard 
                      key={article.id} 
                      article={article} 
                      onDelete={handleDelete}
                      onPublish={handlePublish}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="draft">
              <div className="grid gap-4">
                {filteredItems
                  .filter(article => article.status === "draft")
                  .map((article) => (
                    <NewsArticleCard 
                      key={article.id} 
                      article={article} 
                      onDelete={handleDelete}
                      onPublish={handlePublish}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduled">
              <div className="grid gap-4">
                {filteredItems
                  .filter(article => article.status === "scheduled")
                  .map((article) => (
                    <NewsArticleCard 
                      key={article.id} 
                      article={article} 
                      onDelete={handleDelete}
                      onPublish={handlePublish}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// Extracted to a component for reuse
function NewsArticleCard({ article, onDelete, onPublish, formatDate, getStatusBadge }: any) {
  return (
    <Card key={article.id}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {article.featuredImage && (
                <Badge variant="secondary">Featured</Badge>
              )}
              {getStatusBadge(article.status)}
            </div>
            <CardTitle>{article.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/news/${article.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Article
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/ecosystem-builder/news`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit in Portal
                </Link>
              </DropdownMenuItem>
              {article.status !== "published" && (
                <DropdownMenuItem onClick={() => onPublish(article.id)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Publish Now
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(article.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-muted-foreground mb-4">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              {article.category}
            </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Author</p>
            <p className="font-medium mt-1">{article.author}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <div className="flex items-center mt-1">
              <Calendar className="mr-1 h-3 w-3" />
              <span className="font-medium">
                {article.status === "scheduled" ? "Scheduled for: " : ""}
                {formatDate(article.publishedDate || article.createdAt)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Views</p>
            <div className="flex items-center mt-1">
              <Eye className="mr-1 h-3 w-3" />
              <span className="font-medium">{article.views || 0}</span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Engagement</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center">
                <ThumbsUp className="mr-1 h-3 w-3" />
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center">
                 <MessageSquare className="mr-1 h-3 w-3" />
                 <span className="font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-end w-full gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/news/${article.id}`}>
              View
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/ecosystem-builder/news`}>
              Edit
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
