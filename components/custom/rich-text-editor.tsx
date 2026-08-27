"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 

  Link as LinkIcon, 
  Quote, 
  Undo, 
  Redo, 
  ChevronDown
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, label, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && editorRef.current && value !== editorRef.current.innerHTML) {
       editorRef.current.innerHTML = value || "";
    }
  }, [value, isMounted]);

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCommand("createLink", url);
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      
      <div className="border rounded-md overflow-hidden bg-background">
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/30">
          <ToolbarButton onClick={() => execCommand("bold")} icon={<Bold className="h-4 w-4" />} title="Bold" />
          <ToolbarButton onClick={() => execCommand("italic")} icon={<Italic className="h-4 w-4" />} title="Italic" />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 font-medium">
                Text <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => execCommand("formatBlock", "H1")}>Main Heading (H1)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand("formatBlock", "H2")}>Sub Heading (H2)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand("formatBlock", "P")}>Paragraph</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={<List className="h-4 w-4" />} title="Bullet List" />
          <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={<ListOrdered className="h-4 w-4" />} title="Numbered List" />

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToolbarButton onClick={addLink} icon={<LinkIcon className="h-4 w-4" />} title="Insert Link" />
          <ToolbarButton onClick={() => execCommand("formatBlock", "blockquote")} icon={<Quote className="h-4 w-4" />} title="Quote" />

          <div className="flex-1" />

          <ToolbarButton onClick={() => execCommand("undo")} icon={<Undo className="h-4 w-4" />} title="Undo" />
          <ToolbarButton onClick={() => execCommand("redo")} icon={<Redo className="h-4 w-4" />} title="Redo" />
        </div>

        <div 
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-4 min-h-[400px] focus:outline-none prose prose-sm max-w-none prose-primary"
          style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground italic">Tip: Use these controls to format your content visually.</p>
    </div>
  );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-md hover:bg-muted"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
    >
      {icon}
    </Button>
  );
}
