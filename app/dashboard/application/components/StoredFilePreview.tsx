import { FileIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StoredFileMetadata = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
};

interface StoredFilePreviewProps {
  fileId: string;
  file?: StoredFileMetadata;
  onRemove?: () => void;
  isRemoving?: boolean;
  readOnly?: boolean;
}

export function StoredFilePreview({
  fileId,
  file,
  onRemove,
  isRemoving = false,
  readOnly = false,
}: StoredFilePreviewProps) {
  if (!file) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50 text-muted-foreground animate-pulse">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading file link...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 p-2 border rounded-md bg-muted/50">
      <div className="flex items-center gap-2 overflow-hidden">
        <FileIcon className="h-4 w-4 shrink-0 text-blue-500" />
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline truncate"
        >
          {file.name}
        </a>
        <span className="text-xs text-muted-foreground shrink-0">
          ({(file.size / 1024).toFixed(1)} KB)
        </span>
      </div>
      {!readOnly && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-destructive shrink-0"
          onClick={() => onRemove?.()}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <XIcon className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
