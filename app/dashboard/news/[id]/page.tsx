"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Share2, Bookmark, MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import styles from "../news.module.css";
import React from "react";
import { sanitizeHtml } from "@/lib/sanitize";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [related, setRelated] = useState<any[]>([]);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ecosystem-builder/news/${id}`);
      const result = await res.json();
      if (result.success) {
        setArticle(result.data);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRelated = useCallback(async () => {
    try {
      const res = await fetch("/api/ecosystem-builder/news");
      const result = await res.json();
      if (result.success) {
        setRelated(result.data.filter((a: any) => a.id !== id && a.status === "published").slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
    fetchRelated();
  }, [fetchArticle, fetchRelated]);
  
  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !article) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      {/* Back to news */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900 -ml-3">
          <Link href="/dashboard/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to news
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main content */}
        <div className="lg:col-span-8">
          {/* Article category and sharing */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-brand-startup-amber text-brand-deep-dark font-black px-4 py-1 rounded-full uppercase text-[10px]">{article.category}</Badge>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Article title */}
          <h1 className="text-3xl md:text-5xl font-black text-brand-deep-dark mb-6 leading-tight">{article.title}</h1>
          
          {/* Article metadata */}
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-400 mr-3 flex items-center justify-center text-white font-semibold">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="font-black text-brand-deep-dark">{article.author}</div>
              <div className="text-[11px] font-bold text-slate-500 flex items-center uppercase tracking-wide">
                <span className="mr-3">{new Date(article.publishedDate || article.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-brand-mint-teal" />
                  {Math.ceil(article.content.length / 1000) + 1} min read
                </span>
                <span className="flex items-center ml-3">
                  <span className="mr-1 text-brand-startup-amber tracking-tighter text-[14px]">👁</span>
                  {article.views ?? 0}
                </span>
              </div>
            </div>
          </div>
          
          {/* Featured image */}
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-sm">
            <img 
              src={article.featuredImageFileId ? `/api/files/${article.featuredImageFileId}/download?inline=true` : "https://images.unsplash.com/photo-1580519542036-c47de6d5f2ed?w=1200"} 
              className="w-full h-full object-cover" 
              alt={article.title}
            />
          </div>
          
          {/* Article content */}
          <div 
            className="prose prose-lg max-w-none mb-10 prose-headings:font-bold prose-p:text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
          />

          {/* Image Gallery */}
          {article.images && article.images.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-black text-brand-deep-dark mb-4 uppercase text-xs tracking-widest">Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {article.images.map((img: any) => (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                    <img 
                      src={`/api/files/${img.id}/download?inline=true`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                      alt="Gallery item"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Article tags (Mock tags since DB doesn't have them yet) */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Topic:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-brand-mint-teal/20 text-brand-mint-teal hover:bg-brand-mint-teal/5 uppercase text-[10px] font-black rounded-full px-4 py-1">
                {article.category}
              </Badge>
            </div>
          </div>
          
          {/* Comments section placeholder */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-brand-deep-dark uppercase text-xs tracking-widest">Comments (0)</h3>
              <Button variant="outline" className="flex items-center" disabled>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
            
            <div className="rounded-lg border bg-gray-50 p-6 mb-8">
              <p className="text-gray-500 text-center">
                Sign in to join the conversation and leave a comment
              </p>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4">
          {/* Author info card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <div className="w-14 h-14 rounded-full bg-gray-400 mr-4 flex-shrink-0 flex items-center justify-center text-white text-xl font-semibold">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-brand-deep-dark text-lg">{article.author}</h3>
                  <p className="text-xs font-bold text-brand-mint-teal mb-3 uppercase tracking-widest">StartupET Contributor</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    Covering Ethiopia's rapidly growing startup scene and technological transformation.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View contributor profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Related articles */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-brand-deep-dark mb-6 uppercase tracking-widest">Related Articles</h3>
            <div className="space-y-4">
              {related.map(rel => (
                <Link key={rel.id} href={`/dashboard/news/${rel.id}`} className="block group">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={rel.featuredImage || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500'} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                       <p className="text-[10px] text-brand-mint-teal font-black uppercase tracking-widest mb-1">{rel.category}</p>
                       <h4 className="font-black text-brand-deep-dark text-sm line-clamp-2 group-hover:text-brand-mint-teal transition-colors leading-snug">{rel.title}</h4>
                    </div>
                  </div>
                </Link>
              ))}
              {related.length === 0 && <p className="text-xs text-muted-foreground">No related articles found.</p>}
            </div>
          </div>
          
          {/* Newsletter signup removed */}
        </div>
      </div>
    </div>
  );
}
