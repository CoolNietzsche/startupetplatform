"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Edit,
  Trash,
  Eye,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
} from "./actions";

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<string>("");
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const res = await getTemplates();
    if (res.success) {
      setTemplates(res.data || []);
    } else {
      toast.error(res.message || "Failed to fetch templates");
    }
    setLoading(false);
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setCurrentTemplate({ code: "", name: "", subject: "", body: "", type: "info" });
    setIsEditing(false);
    setShowFormDialog(true);
  };

  const handleEdit = (template: any) => {
    setCurrentTemplate({ ...template });
    setIsEditing(true);
    setShowFormDialog(true);
  };

  const handleDeleteClick = (template: any) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    const res = await deleteTemplate(templateToDelete.id);
    if (res.success) {
      toast.success("Template deleted");
      fetchTemplates();
    } else {
      toast.error(res.message);
    }
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  const handleSave = async () => {
    if (!currentTemplate.code.trim() || !currentTemplate.name.trim()) {
      toast.error("Code and name are required");
      return;
    }

    setIsSaving(true);
    let res;
    if (isEditing) {
      res = await updateTemplate(currentTemplate.id, {
        code: currentTemplate.code,
        name: currentTemplate.name,
        subject: currentTemplate.subject,
        body: currentTemplate.body,
        type: currentTemplate.type,
      });
    } else {
      res = await createTemplate({
        code: currentTemplate.code,
        name: currentTemplate.name,
        subject: currentTemplate.subject,
        body: currentTemplate.body,
        type: currentTemplate.type,
      });
    }

    if (res.success) {
      toast.success(isEditing ? "Template updated" : "Template created");
      fetchTemplates();
      setShowFormDialog(false);
    } else {
      toast.error(res.message);
    }
    setIsSaving(false);
  };

  const handlePreviewClick = (template: any) => {
    setCurrentTemplate(template);
    setPreviewVariables("");
    setPreviewResult(null);
    setShowPreviewDialog(true);
  };

  const handlePreviewRender = async () => {
    if (!currentTemplate) return;
    setIsPreviewLoading(true);

    let variables: Record<string, string> = {};
    try {
      if (previewVariables.trim()) {
        const pairs = previewVariables.split(",").map((s) => s.trim());
        for (const pair of pairs) {
          const [key, val] = pair.split(":").map((s) => s.trim());
          if (key) variables[key] = val || "";
        }
      }
    } catch {
      variables = {};
    }

    const res = await previewTemplate(currentTemplate.id, variables);
    if (res.success) {
      setPreviewResult(res.data);
    } else {
      toast.error(res.message);
    }
    setIsPreviewLoading(false);
  };

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "success" as const;
      case "warning":
        return "warning" as const;
      case "error":
        return "destructive" as const;
      default:
        return "info" as const;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
                  Notification Templates
                </h1>
                <p className="text-sm text-slate-500 font-medium tracking-tight">
                  Manage email and notification message templates
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            className="gap-2 bg-slate-900 hover:bg-black text-white shadow-sm border-0 rounded-xl px-5 h-10 font-bold"
          >
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Filter templates by name or code..."
              className="pl-9 bg-white border-slate-200 rounded-xl focus-visible:ring-slate-950 placeholder:text-slate-400 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Templates Table */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-6 py-4">
                  Code
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">
                  Name
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider py-4">
                  Type
                </TableHead>
                <TableHead className="w-[140px] py-4 pr-6 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">
                        Loading templates...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <p className="font-bold text-slate-400">
                      No templates found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow
                    key={template.id}
                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 group"
                  >
                    <TableCell className="pl-6 py-5">
                      <code className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {template.code}
                      </code>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-950">
                          {template.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {template.subject}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge
                        variant={typeBadgeVariant(template.type)}
                        className="text-[10px] font-bold uppercase"
                      >
                        {template.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600"
                          onClick={() => handlePreviewClick(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600"
                          onClick={() => handleDeleteClick(template)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
          <DialogContent className="max-w-2xl rounded-2xl border-slate-200 bg-white shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-black text-slate-950 uppercase tracking-tight">
                  {isEditing ? "Edit Template" : "Create Template"}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="text-sm font-black text-slate-700 uppercase tracking-tighter"
                  >
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={currentTemplate?.code || ""}
                    onChange={(e) =>
                      setCurrentTemplate({
                        ...currentTemplate,
                        code: e.target.value,
                      })
                    }
                    placeholder="e.g. welcome_email"
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-sm font-black text-slate-700 uppercase tracking-tighter"
                  >
                    Type
                  </Label>
                  <Select
                    value={currentTemplate?.type || "info"}
                    onValueChange={(value) =>
                      setCurrentTemplate({ ...currentTemplate, type: value })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-black text-slate-700 uppercase tracking-tighter"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  value={currentTemplate?.name || ""}
                  onChange={(e) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Welcome Email"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-sm font-black text-slate-700 uppercase tracking-tighter"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={currentTemplate?.subject || ""}
                  onChange={(e) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Hello {{name}}, welcome to {{platform}}!"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="body"
                  className="text-sm font-black text-slate-700 uppercase tracking-tighter"
                >
                  Body
                </Label>
                <Textarea
                  id="body"
                  value={currentTemplate?.body || ""}
                  onChange={(e) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      body: e.target.value,
                    })
                  }
                  placeholder="Hi {{name}},\n\nYour account has been created..."
                  className="min-h-[200px] rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowFormDialog(false)}
                className="rounded-xl border-slate-200 font-bold px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-slate-900 hover:bg-black text-white px-8 font-black shadow-lg shadow-slate-200"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md rounded-2xl border-slate-200 bg-white p-0 overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter">
                  Delete Template
                </h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="text-slate-900 font-black">
                    {templateToDelete?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <DialogFooter className="p-6 pt-2 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-xl flex-1 border-slate-200 font-bold h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white font-black h-11 shadow-lg shadow-red-100"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-2xl rounded-2xl border-slate-200 bg-white shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-black text-slate-950 uppercase tracking-tight">
                  Preview: {currentTemplate?.name}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                  Sample Variables
                </Label>
                <p className="text-xs text-slate-500 font-medium">
                  Enter key:value pairs separated by commas. e.g.{" "}
                  <code className="bg-slate-100 px-1 rounded">
                    name:John, platform:NSLP, year:2026
                  </code>
                </p>
                <Input
                  value={previewVariables}
                  onChange={(e) => setPreviewVariables(e.target.value)}
                  placeholder="name:John, platform:NSLP"
                  className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-950 font-bold"
                />
              </div>

              <Button
                onClick={handlePreviewRender}
                disabled={isPreviewLoading}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 font-black shadow-lg"
              >
                {isPreviewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Render Preview
              </Button>

              {previewResult && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                      Rendered Subject
                    </Label>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900">
                      {previewResult.subject}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                      Rendered Body
                    </Label>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap font-medium">
                      {previewResult.body}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowPreviewDialog(false)}
                className="rounded-xl border-slate-200 font-bold px-6"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
