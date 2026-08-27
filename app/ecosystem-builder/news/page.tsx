"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  User,
  Clock,
  SendHorizonal,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitize";
import { MultiImageUpload } from "@/components/custom/multi-image-upload";
import { RichTextEditor } from "@/components/custom/rich-text-editor";

const CATEGORIES = [
  "Ecosystem News",
  "Funding",
  "Events",
  "Policy",
  "Success Stories",
];

type NewsStatus = "draft" | "published" | "scheduled";

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featuredImageFileId: string;
  imageFileIds: string[];
  author: string;
  status: NewsStatus;
  publishedDate: string;
}

const emptyForm = (authorName: string): FormData => ({
  title: "",
  excerpt: "",
  content: "",
  category: "",
  featuredImageFileId: "",
  imageFileIds: [],
  author: authorName,
  status: "draft",
  publishedDate: "",
});

export default function EcosystemBuilderNewsPage() {
  const { data: session } = useSession();
  const authorName =
    session?.user?.name ||
    `${(session?.user as any)?.firstName ?? ""} ${(session?.user as any)?.lastName ?? ""}`.trim() ||
    "Ecosystem Builder";

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false); // synchronous guard against double-submit

  const [formData, setFormData] = useState<FormData>(emptyForm(authorName));

  // Sync author once session loads
  useEffect(() => {
    if (authorName && !formData.author) {
      setFormData((prev) => ({ ...prev, author: authorName }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorName]);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ecosystem-builder/news");
      const result = await res.json();
      if (result.success) {
        setArticles(result.data);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Article title is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.excerpt.trim()) {
      toast.error("Excerpt / Summary is required");
      return false;
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("Article content is required");
      return false;
    }
    if (formData.status === "scheduled" && !formData.publishedDate) {
      toast.error("Please set a publish date for scheduled articles");
      return false;
    }
    return true;
  };

  const handleCreateArticle = async () => {
    if (submittingRef.current) return; // synchronous guard
    if (!validateForm()) return;
    submittingRef.current = true;
    setSaving(true);
    // Unique ID for this submission — server uses it to deduplicate if React
    // StrictMode double-fires the request in development mode.
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try {
      const res = await fetch("/api/ecosystem-builder/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          ...formData,
          publishedDate:
            formData.status === "scheduled" && formData.publishedDate
              ? formData.publishedDate
              : null,
        }),
      });
      if (res.status === 401) {
        toast.error("Session expired. Please refresh and sign in again.");
        return;
      }
      const result = await res.json();
      if (result.success) {
        toast.success(
          formData.status === "scheduled"
            ? "Article scheduled successfully"
            : formData.status === "published"
            ? "Article published"
            : "Article saved as draft"
        );
        fetchArticles();
        setShowCreateForm(false);
        setFormData(emptyForm(authorName));
      } else {
        toast.error(result.error || "Failed to create article");
      }
    } catch {
      toast.error("Failed to create article");
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  const handleUpdateArticle = async () => {
    if (submittingRef.current) return; // block instant double-click
    if (!selectedArticle) return;
    if (!validateForm()) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/ecosystem-builder/news/${selectedArticle.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            publishedDate:
              formData.status === "scheduled" && formData.publishedDate
                ? formData.publishedDate
                : formData.status === "published"
                ? new Date().toISOString()
                : null,
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success("Article updated successfully");
        fetchArticles();
        setIsEditDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to update article");
      }
    } catch {
      toast.error("Failed to update article");
    } finally {
      setSaving(false);
      submittingRef.current = false;
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
        fetchArticles();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to publish");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/ecosystem-builder/news/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Article deleted");
        fetchArticles();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEditDialog = (article: any) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content || "",
      category: article.category,
      featuredImageFileId: article.featuredImageFileId || "",
      imageFileIds: article.images?.map((img: any) => img.id) || [],
      author: article.author || authorName,
      status: article.status as NewsStatus,
      publishedDate: article.publishedDate
        ? new Date(article.publishedDate).toISOString().slice(0, 16)
        : "",
    });
    setIsEditDialogOpen(true);
  };

  const handlePreview = async (article: any) => {
    setSelectedArticle(article);
    setIsPreviewDialogOpen(true);
    
    // Fetch fresh data from API to increment views
    try {
      const res = await fetch(`/api/ecosystem-builder/news/${article.id}`);
      const result = await res.json();
      if (result.success) {
        setSelectedArticle(result.data);
        // Silently update the article in the local list to show the new view count
        setArticles(prev => prev.map(a => a.id === result.data.id ? result.data : a));
      }
    } catch (e) {
      console.error("Failed to update view count", e);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-300">
            ✅ Published
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="h-3 w-3 mr-1 inline" /> Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
            <FileText className="h-3 w-3 mr-1 inline" /> Draft
          </Badge>
        );
    }
  };

  // ─── Shared form fields ── rendered inline (NOT as a nested component)
  // This avoids the React unmount/remount focus-loss bug that happens when
  // a component is defined inside another component's render function.
  const formFields = (
    <div className="space-y-5">
      {/* Title */}
      <div className="grid gap-1.5">
        <Label htmlFor="news-title">
          Article Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="news-title"
          placeholder="Enter article title..."
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </div>

      {/* Author */}
      <div className="grid gap-1.5">
        <Label htmlFor="news-author" className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> Author
        </Label>
        <Input
          id="news-author"
          placeholder="Author name"
          value={formData.author}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, author: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Auto-filled from your login. You may override if publishing on behalf
          of another.
        </p>
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, category: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label>
            Publish Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                status: v as NewsStatus,
                publishedDate:
                  v !== "scheduled" ? "" : prev.publishedDate,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">📄 Draft</SelectItem>
              <SelectItem value="scheduled">🕐 Schedule for Later</SelectItem>
              <SelectItem value="published">✅ Publish Now</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scheduled Date — only when status = scheduled */}
      {formData.status === "scheduled" && (
        <div className="grid gap-1.5 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Label
            htmlFor="news-publishedDate"
            className="flex items-center gap-1.5 text-blue-800"
          >
            <Calendar className="h-3.5 w-3.5" /> Scheduled Publish Date &amp;
            Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="news-publishedDate"
            type="datetime-local"
            value={formData.publishedDate}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                publishedDate: e.target.value,
              }))
            }
            className="bg-white"
          />
          <p className="text-xs text-blue-700">
            Article will be marked as &quot;Scheduled&quot; until this
            date/time.
          </p>
        </div>
      )}

      {/* Excerpt */}
      <div className="grid gap-1.5">
        <Label htmlFor="news-excerpt">
          Excerpt / Summary <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="news-excerpt"
          rows={3}
          placeholder="A short preview of the article..."
          value={formData.excerpt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
          }
        />
      </div>

      {/* Rich Text Content */}
      <div className="grid gap-1.5">
        <RichTextEditor
          label="Article Body *"
          placeholder="Write the full article content here..."
          value={formData.content}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, content: val }))
          }
        />
      </div>

      {/* Images */}
      <div className="grid gap-1.5">
        <MultiImageUpload
          label="Article Assets (First image becomes Cover, Max 5)"
          value={formData.imageFileIds}
          onChange={(ids) =>
            setFormData((prev) => ({
              ...prev,
              imageFileIds: ids,
              featuredImageFileId: ids.length > 0 ? ids[0] : "",
            }))
          }
          maxImages={5}
        />
      </div>
    </div>
  );

  // ─── CREATE FULL PAGE ────────────────────────────────────────────────────────
  if (showCreateForm) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Article
            </h1>
            <p className="text-muted-foreground">
              Write and publish news articles or press releases for the startup
              ecosystem
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateForm(false);
              setFormData(emptyForm(authorName));
            }}
          >
            Cancel
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {formFields}
            <div className="flex justify-end gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData(emptyForm(authorName));
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateArticle} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SendHorizonal className="h-4 w-4 mr-2" />
                )}
                {formData.status === "scheduled"
                  ? "Schedule Article"
                  : formData.status === "published"
                  ? "Publish Now"
                  : "Save as Draft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── MAIN LIST PAGE ──────────────────────────────────────────────────────────
  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            News &amp; PR Management
          </h1>
          <p className="text-muted-foreground">
            Manage articles for the startup ecosystem
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-muted-foreground">
            Total Articles
          </p>
          <p className="text-2xl font-bold">{articles.length}</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {articles.filter((a) => a.status === "published").length}
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">
            {articles.filter((a) => a.status === "scheduled").length}
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-amber-600">
            {articles.filter((a) => a.status === "draft").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Article List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No articles found</p>
          <p className="text-sm">
            Try adjusting your filters or create a new article.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <CardTitle className="text-xl truncate">
                      {article.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {getStatusBadge(article.status)}
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {article.author}
                      </span>
                      {article.publishedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.publishedDate).toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs">👁 {article.views ?? 0} views</span>
                    </div>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Preview"
                      onClick={() => handlePreview(article)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Edit"
                      onClick={() => openEditDialog(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {article.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        title="Publish Now"
                        onClick={() => handlePublish(article.id)}
                      >
                        <SendHorizonal className="h-4 w-4 mr-1" /> Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      title="Delete"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* ── EDIT DIALOG ─────────────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[72vh] overflow-y-auto pr-1">
            {formFields}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateArticle} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PREVIEW DIALOG ──────────────────────────────────────── */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview Article</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4 py-4 max-h-[72vh] overflow-y-auto">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Title
                </p>
                <p className="font-semibold text-lg">{selectedArticle.title}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedArticle.status)}
                <Badge variant="outline">{selectedArticle.category}</Badge>
                <Badge variant="secondary">
                  <User className="h-3 w-3 mr-1" /> {selectedArticle.author}
                </Badge>
                {selectedArticle.publishedDate && (
                  <Badge variant="secondary">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(selectedArticle.publishedDate).toLocaleString()}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Excerpt
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {selectedArticle.excerpt}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Content
                </p>
                <div
                  className="p-4 rounded-md border bg-muted/20 prose prose-sm max-w-none min-h-[120px]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedArticle.content) }}
                />
              </div>

              {(selectedArticle.images?.length > 0 ||
                selectedArticle.featuredImageFileId) && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Assets
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedArticle.featuredImageFileId && (
                      <div className="group relative aspect-square rounded-xl overflow-hidden border-2 border-primary/50 shadow-sm">
                        <Badge className="absolute top-1 left-1 z-10 text-[9px] bg-primary px-1">
                          COVER
                        </Badge>
                        <img
                          src={`/api/files/${selectedArticle.featuredImageFileId}/download?inline=true`}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {selectedArticle.images
                      ?.filter(
                        (img: any) =>
                          img.id !== selectedArticle.featuredImageFileId
                      )
                      .map((img: any) => (
                        <div
                          key={img.id}
                          className="aspect-square rounded-xl overflow-hidden border-2 border-muted shadow-sm"
                        >
                          <img
                            src={`/api/files/${img.id}/download?inline=true`}
                            alt="Asset"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
