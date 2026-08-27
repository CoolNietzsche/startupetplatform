"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, UploadCloud, File as FileIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
    value: string[];
    onChange: (ids: string[]) => void;
    maxFiles?: number;
    maxSize?: number;
    acceptedTypes?: string[];
    label?: string;
}

interface FileMetadata {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
}

export function FileUploader({
    value = [],
    onChange,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = [],
    label
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<{ name: string; status: 'uploading' | 'success' | 'error' }[]>([]);
    const [fileMetadatas, setFileMetadatas] = useState<Record<string, FileMetadata>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch metadata for existing files
    useEffect(() => {
        const fetchMetadata = async (id: string) => {
            if (fileMetadatas[id] || !id) return;
            try {
                const response = await fetch(`/api/files/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFileMetadatas(prev => ({ ...prev, [id]: data }));
                }
            } catch (error) {
                console.error(`Failed to fetch metadata for file ${id}`, error);
            }
        };

        if (Array.isArray(value)) {
            value.forEach(id => {
                if (id) fetchMetadata(id);
            });
        }
    }, [value, fileMetadatas]);

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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const processFiles = async (files: File[]) => {
        if (files.length === 0) return;

        const safeValue = Array.isArray(value) ? value : [];

        if (safeValue.length + files.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed. You can only add ${maxFiles - safeValue.length} more.`);
            return;
        }

        const validFiles = files.filter(file => {
            if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
                // Check for extension matches if mime type sharing is tricky
                const ext = "." + file.name.split('.').pop()?.toLowerCase();
                const isAcceptedExt = acceptedTypes.some(type => {
                    if (type.startsWith('.')) return type.toLowerCase() === ext;
                    return false;
                });
                
                if (!isAcceptedExt) {
                    toast.error(`${file.name} is not an accepted file type.`);
                    return false;
                }
            }
            if (file.size > maxSize) {
                toast.error(`${file.name} exceeds the maximum size of ${formatFileSize(maxSize)}.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Track state of current uploads
        const currentUploads = validFiles.map(f => ({ name: f.name, status: 'uploading' as const }));
        setUploadingFiles(prev => [...prev, ...currentUploads]);

        let currentIds = [...safeValue];

        for (const file of validFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "INVESTOR_DOCUMENT");
            formData.append("isPublic", "false");

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
                
                // Update IDs immediately
                currentIds = [...currentIds, data.id];
                onChange(currentIds);

                // Update status and store metadata
                setFileMetadatas(prev => ({ ...prev, [data.id]: data }));
                setUploadingFiles(prev => prev.map(f => 
                    f.name === file.name ? { ...f, status: 'success' } : f
                ));

                // Remove from progress list after success
                setTimeout(() => {
                    setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
                }, 2000);

            } catch (err: any) {
                console.warn(`[FileUploader] Failed uploading ${file.name}:`, err);
                toast.error(`${file.name}: ${err.message}`);
                setUploadingFiles(prev => prev.map(f => 
                    f.name === file.name ? { ...f, status: 'error' } : f
                ));
            }
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (idToRemove: string) => {
        const safeValue = Array.isArray(value) ? value : [];
        onChange(safeValue.filter(id => id !== idToRemove));
    };

    return (
        <div className="space-y-4 w-full">
            {label && (
                <div className="flex items-center justify-between px-1">
                    <Label className="text-sm font-bold uppercase tracking-widest text-[#2c3e50]/70">{label}</Label>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase font-black text-[9px] tracking-tighter">
                        {Array.isArray(value) ? value.length : 0} / {maxFiles} Files
                    </Badge>
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
                {/* Existing Files */}
                {Array.isArray(value) && value.map((id) => {
                    if (!id) return null;
                    const metadata = fileMetadatas[id];
                    return (
                        <div key={id} className="flex items-center justify-between p-3 rounded-xl border border-muted bg-muted/30 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileIcon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">
                                        {metadata?.originalName || "Loading..."}
                                    </span>
                                    {metadata && (
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                            {formatFileSize(metadata.size)} • {metadata.mimeType.split('/')[1]?.toUpperCase() || "FILE"}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeFile(id)}
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
                
                {/* Dropzone / Upload Button */}
                {(Array.isArray(value) ? value.length : 0) < maxFiles && (
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "py-8 rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden group shadow-sm",
                            isDragging 
                                ? "border-primary bg-primary/10 scale-[0.99] ring-4 ring-primary/5" 
                                : "border-muted-foreground/20 bg-muted/20 hover:bg-background hover:border-primary/40 hover:shadow-lg"
                        )}
                    >
                        <div className="flex flex-col items-center transition-all duration-500 group-hover:-translate-y-1">
                            <div className="p-3 rounded-full bg-background shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 mb-2">
                                <UploadCloud className="h-6 w-6" />
                            </div>
                            <span className="text-xs uppercase font-black tracking-widest text-[#2c3e50]/80 group-hover:text-primary transition-colors">
                                {isDragging ? "Drop files here" : "Upload Documents"}
                            </span>
                            <span className="text-[9px] text-[#2c3e50]/40 font-bold uppercase mt-1 px-4 text-center">
                                Max {formatFileSize(maxSize)} per file
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Processing Status */}
            {uploadingFiles.length > 0 && (
                <div className="bg-muted/30 rounded-xl border border-dashed border-primary/20 overflow-hidden">
                    <div className="p-3 space-y-3">
                        {uploadingFiles.map((file, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="truncate max-w-[200px] flex items-center gap-2 text-[#2c3e50]/70">
                                        {file.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
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
                accept={acceptedTypes.join(',')} 
                multiple={maxFiles > 1}
                className="hidden" 
            />
        </div>
    );
}
