"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Download, Eye } from "lucide-react";

interface DocumentPreviewProps {
  label: string;
  fileId: string | null;
}

export function DocumentPreview({ label, fileId }: DocumentPreviewProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);

  if (!fileId) {
    return (
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p>Not uploaded</p>
      </div>
    );
  }

  const handlePreviewClick = () => {
    setIsPreviewing(true);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium">{label}</h4>
      <div className="border rounded-lg overflow-hidden">
        {!isPreviewing ? (
          <div className="flex items-center justify-center h-[200px] bg-gray-50">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">
                Click to preview document
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviewClick}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Document
              </Button>
              <div className="mt-2">
                <Link
                  href={`/api/files/${fileId}/download`}
                  className="text-sm font-medium text-green-700 hover:underline"
                >
                  <Download className="inline mr-1 h-3 w-3" />
                  Download
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={`/api/files/${fileId}/download?inline=true`}
            className="w-full h-[600px]"
            title={label}
          />
        )}
      </div>
    </div>
  );
}
