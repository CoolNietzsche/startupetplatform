"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, UploadCloud,  Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface MultiImageUploadProps {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({ value = [], onChange, label, maxImages = 5 }: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; status: 'uploading' | 'success' | 'error' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed. You can only add ${maxImages - value.length} more.`);
      return;
    }

    const validFiles = files.filter(file => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Please upload only image files.");
    }

    if (validFiles.length === 0) return;

    // Track state of current uploads
    const currentUploads = validFiles.map(f => ({ name: f.name, status: 'uploading' as const }));
    setUploadingFiles(prev => [...prev, ...currentUploads]);

    let currentIds = [...value];

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "PUBLIC_ASSET");
      formData.append("isPublic", "true");

      try {
        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Update IDs immediately so user sees the progress
        currentIds = [...currentIds, data.id];
        onChange(currentIds);

        // Update status for this file
        setUploadingFiles(prev => prev.map(f => 
          f.name === file.name ? { ...f, status: 'success' } : f
        ));

        // Remove from progress list after success
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        }, 2000);

      } catch (err: any) {
        console.warn(`[MultiImageUpload] Failed uploading ${file.name}:`, err);
        toast.error(`${file.name}: ${err.message}`);
        setUploadingFiles(prev => prev.map(f => 
          f.name === file.name ? { ...f, status: 'error' } : f
        ));
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idToRemove: string) => {
    onChange(value.filter(id => id !== idToRemove));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between px-1">
        {label && <Label className="text-sm font-bold uppercase tracking-widest text-[#2c3e50]/70">{label}</Label>}
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase font-black text-[9px] tracking-tighter">
          {value.length} / {maxImages} Managed Assets
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Existing Assets */}
        {value.map((id) => (
          <div key={id} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-muted bg-muted shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
            <img 
              src={`/api/files/${id}/download?inline=true`} 
              alt="Asset" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
               <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={() => removeImage(id)}
                className="h-10 w-10 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute top-3 left-3 pointer-events-none drop-shadow-md">
              <CheckCircle2 className="h-5 w-5 text-green-400 opacity-90" />
            </div>
          </div>
        ))}
        
        {/* Dropzone / Upload Button */}
        {value.length < maxImages && (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "aspect-square rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden group shadow-sm",
              isDragging 
                ? "border-primary bg-primary/10 scale-[0.97] ring-8 ring-primary/10" 
                : "border-[#2c3e50]/10 bg-muted/20 hover:bg-background hover:border-primary/40 hover:shadow-lg"
            )}
          >
            <div className="flex flex-col items-center transition-all duration-500 group-hover:-translate-y-2">
              <div className="p-4 rounded-full bg-background shadow-md group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 mb-2 scale-90 group-hover:scale-100 ring-4 ring-transparent group-hover:ring-primary/20">
                <UploadCloud className="h-7 w-7" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#2c3e50]/80 group-hover:text-primary transition-colors">Add Assets</span>
              <span className="text-[9px] text-[#2c3e50]/40 font-bold uppercase mt-1 px-4 text-center">Batch Processing Enabled</span>
            </div>
            
            {/* Aesthetic Background */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 -rotate-12 group-hover:rotate-0 group-hover:scale-125">
               <ImageIcon size={100} />
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Processing Status */}
      {uploadingFiles.length > 0 && (
        <div className="bg-muted/30 rounded-2xl border-2 border-dashed border-primary/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing Intelligence Pipeline
               </h4>
            </div>
            {uploadingFiles.map((file, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="truncate max-w-[200px] flex items-center gap-2 text-[#2c3e50]/70">
                    {file.status === 'uploading' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    {file.status === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                    {file.status === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
                    {file.name}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px]",
                    file.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'
                  )}>
                    {file.status.toUpperCase()}
                  </span>
                </div>
                {file.status === 'uploading' && (
                   <Progress value={undefined} className="h-1 bg-background" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => processFiles(Array.from(e.target.files || []))} 
        accept="image/*" 
        multiple={maxImages > 1}
        className="hidden" 
      />
      
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
        <div className="flex items-center gap-2 opacity-30 group cursor-default">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] group-hover:text-primary transition-colors">
            Secure Digital Asset Ledger
           </p>
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent" />
      </div>
    </div>
  );
}
