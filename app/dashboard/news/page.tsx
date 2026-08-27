"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Share2, Bookmark, Filter, TrendingUp, Calendar, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import styles from "./news.module.css";
import { FeatureGuard } from "@/components/feature-guard";

// Categories will be derived from data

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ecosystem-builder/news");
      const result = await res.json();
      if (result.success) {
        // Only show published articles to the public
        setArticles(result.data.filter((a: any) => a.status === "published"));
      }
    } catch (error) {
      console.error("Failed to load news articles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const categories = ["all", ...Array.from(new Set(articles.map(a => a.category))).filter(Boolean)];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredArticles[0] || null;
  const latestNews = filteredArticles.slice(1);

  return (
    <FeatureGuard 
      featureId="startup-news" 
      userRole="startup"
      fallback={
        <div className="max-w-7xl mx-auto py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">News Page Disabled</h1>
          <p className="text-muted-foreground">This feature has been disabled by the administrator.</p>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-brand-deep-dark">StartupET News</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-9 md:w-64 lg:w-80"
                placeholder="Search news..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* News Categories */}
        <div className="overflow-x-auto whitespace-nowrap mb-8 pb-1 hidden md:block">
          <div className="inline-flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 font-bold transition-all ${
                  selectedCategory === cat 
                    ? "bg-brand-mint-teal text-white hover:bg-brand-mint-teal/90 shadow-md" 
                    : "border-slate-200 text-brand-deep-dark/60 hover:bg-brand-mint-teal/5 hover:text-brand-mint-teal"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Mobile category dropdown */}
        <div className="mb-8 md:hidden">
          <select 
            className="w-full border border-slate-200 rounded-xl p-3 font-bold text-brand-deep-dark/60 focus:ring-brand-mint-teal focus:border-brand-mint-teal"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select news category"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Main content area */}
            <div className="lg:col-span-3">
              {/* Featured story */}
              {featuredNews && (
                <div className="mb-12">
                  <div className="group relative rounded-3xl overflow-hidden bg-brand-mint-teal/10 h-[450px] mb-4 border border-brand-mint-teal/20">
                    <div 
                      className={`absolute inset-0 ${styles.featuredImageBg}`}
                      style={{ '--bg-image-url': `url(${featuredNews.featuredImageFileId ? `/api/files/${featuredNews.featuredImageFileId}/download?inline=true` : 'https://images.unsplash.com/photo-1579621970588-a35d7e7ab9b6?w=1200'})` } as React.CSSProperties}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-mint-teal/95 via-brand-mint-teal/40 to-transparent"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <Badge className="mb-4 bg-brand-startup-amber text-brand-deep-dark font-black px-4 py-1 rounded-full uppercase text-[10px]">{featuredNews.category}</Badge>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                        {featuredNews.title}
                      </h2>
                      <p className="text-white/90 mb-6 max-w-3xl line-clamp-2 font-medium">
                        {featuredNews.excerpt}
                      </p>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 mr-4 flex items-center justify-center text-white font-black text-lg">
                          {featuredNews.author.charAt(0)}
                        </div>
                        <div className="text-white">
                          <div className="font-black text-lg">{featuredNews.author}</div>
                          <div className="text-sm text-white/70">
                            {new Date(featuredNews.publishedDate || featuredNews.createdAt).toLocaleDateString()} • {Math.ceil(featuredNews.content.length / 1000) + 1} min read
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-4">
                    <Button className="text-brand-mint-teal font-black uppercase text-xs p-0 h-auto hover:text-brand-mint-teal/80" variant="link" asChild>
                      <Link href={`/dashboard/news/${featuredNews.id}`}>
                        Read Full Article <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator className="mb-10" />
              
              {/* Latest news section */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6">Latest News</h2>
                
                <div className="space-y-10">
                  {latestNews.map((news) => (
                    <div key={news.id} className="group">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video">
                            <div 
                              className={styles.newsItemImageBg}
                              style={{ '--bg-image-url': `url(${news.featuredImageFileId ? `/api/files/${news.featuredImageFileId}/download?inline=true` : 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500'})` } as React.CSSProperties}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <Badge className="mb-2 bg-brand-mint-teal/10 text-brand-mint-teal hover:bg-brand-mint-teal/20 border border-brand-mint-teal/20 px-3 py-0.5 rounded-full font-bold uppercase text-[9px]">
                            {news.category}
                          </Badge>
                          
                          <h3 className="text-xl font-black mb-2 group-hover:text-brand-mint-teal transition-colors leading-snug">
                            <Link href={`/dashboard/news/${news.id}`}>
                              {news.title}
                            </Link>
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{news.excerpt}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 mr-3 flex items-center justify-center text-brand-mint-teal font-black text-xs border border-slate-200">
                                {news.author.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-slate-600 mr-3">{news.author}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {new Date(news.publishedDate || news.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                                <Bookmark className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                                <Share2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredArticles.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">No news articles found matching your criteria.</p>
                  )}
                </div>
                
                {filteredArticles.length > 5 && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" size="lg">
                      Load More News
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar content simplified */}
            <div className="lg:col-span-1 space-y-10">
              {/* Trending Topics */}
              {/* Trending Topics - Removed mock data */}
              {articles.length > 5 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-brand-mint-teal" />
                    <h3 className="text-lg font-black uppercase text-brand-deep-dark">Trending Now</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {Array.from(new Set(articles.map(a => a.category))).slice(0, 4).map((topic: any, i) => (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <Button variant="link" onClick={() => setSelectedCategory(topic)} className="text-slate-600 p-0 h-auto font-bold hover:text-brand-mint-teal text-xs">
                          #{topic.replace(/\s+/g, '')}
                        </Button>
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-brand-startup-amber text-brand-startup-amber">Popular</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Newsletter Signup */}
              {/* Newsletter section removed */}
            </div>
          </div>
        )}
      </div>
    </FeatureGuard>
  );
}
