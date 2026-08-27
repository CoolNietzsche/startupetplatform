"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  CheckSquare,
  ExternalLink,
  Clock,
  Eye,
  Trash2,
  Tag,
  Edit,
  Building,
  Palette,
  Download
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Types for notes system
type NoteType = {
  id: string;
  text: string;
  category: string;
  timestamp: string;
  documentId: string;
  documentName: string;
  documentType: string;
  startupId: string;
  startupName: string;
  assessmentId: string;
};

const SAMPLE_NOTES: NoteType[] = [];

// Function to get category icon component
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'strength':
      return <ThumbsUp className="h-4 w-4 text-green-500" />;
    case 'weakness':
      return <ThumbsDown className="h-4 w-4 text-red-500" />;
    case 'question':
      return <HelpCircle className="h-4 w-4 text-amber-500" />;
    case 'action':
      return <CheckSquare className="h-4 w-4 text-blue-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

// Function to get category label
const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'strength': return 'Strength';
    case 'weakness': return 'Weakness';
    case 'question': return 'Question';
    case 'action': return 'Action Item';
    default: return 'General';
  }
};

// Function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    day: 'numeric', 
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

export default function NotesPage() {
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [startupFilter, setStartupFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('all');
  const [useColoredCards, setUseColoredCards] = useState(true);
  
  // State for editing and deleting
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');
  const [editNoteCategory, setEditNoteCategory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for document viewing
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [documentToView, setDocumentToView] = useState<{url: string, name: string, type: string} | null>(null);
  
  // Get note card color based on category
  const getNoteCardColor = (category: string) => {
    if (!useColoredCards) return 'bg-card';
    
    switch (category) {
      case 'strength':
        return 'bg-green-50 dark:bg-green-950/30';
      case 'weakness':
        return 'bg-red-50 dark:bg-red-950/30';
      case 'question':
        return 'bg-amber-50 dark:bg-amber-950/30';
      case 'action':
        return 'bg-blue-50 dark:bg-blue-950/30';
      default:
        return 'bg-card';
    }
  };
  
  // Get note card border color based on category
  const getNoteCardBorder = (category: string) => {
    if (!useColoredCards) return 'border';
    
    switch (category) {
      case 'strength':
        return 'border-green-200 dark:border-green-800';
      case 'weakness':
        return 'border-red-200 dark:border-red-800';
      case 'question':
        return 'border-amber-200 dark:border-amber-800';
      case 'action':
        return 'border-blue-200 dark:border-blue-800';
      default:
        return 'border';
    }
  };
  
  // Filter and sort notes based on current filters
  const filteredNotes = SAMPLE_NOTES.filter(note => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Startup filter
    const matchesStartup = startupFilter === 'all' || note.startupId === startupFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    
    return matchesSearch && matchesStartup && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === 'date-asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortBy === 'startup') {
      return a.startupName.localeCompare(b.startupName);
    } else {
      return 0;
    }
  });
  
  // Get unique startups for the filter dropdown
  const startups = Array.from(new Set(SAMPLE_NOTES.map(note => note.startupId))).map(
    startupId => ({
      id: startupId,
      name: SAMPLE_NOTES.find(note => note.startupId === startupId)?.startupName || ''
    })
  );
  
  // Group notes by startup for the grouped view
  const notesByStartup = filteredNotes.reduce((acc, note) => {
    if (!acc[note.startupId]) {
      acc[note.startupId] = {
        name: note.startupName,
        notes: []
      };
    }
    acc[note.startupId].notes.push(note);
    return acc;
  }, {} as Record<string, { name: string; notes: NoteType[] }>);
  
  // Handle delete note
  const handleDeleteNote = () => {
    if (selectedNote) {
      setIsProcessing(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Here you would make an API call to delete the note
        
        // Show success toast or message in a real app
        toast.success('Note deleted successfully');
        
        setShowDeleteDialog(false);
        setSelectedNote(null);
        setIsProcessing(false);
      }, 500);
    }
  };
  
  // Handle edit note
  const handleEditNote = () => {
    if (selectedNote && editNoteText.trim()) {
      setIsProcessing(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Here you would make an API call to update the note
        
        // Show success toast or message in a real app
        toast.success('Note updated successfully');
        
        setShowEditDialog(false);
        setSelectedNote(null);
        setEditNoteText('');
        setEditNoteCategory('');
        setIsProcessing(false);
      }, 500);
    }
  };
  
  // Handle opening document preview
  const handleViewDocument = (note: NoteType) => {
    // In a real app, this would use the actual document URL from the API
    // For demo, we'll use a placeholder PDF for all documents
    const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    if (note.documentType.includes('xlsx')) {
      // Show message that we can't preview Excel files
      toast.error('Excel files cannot be previewed directly. Please view in the assessment page.');
      return;
    }
    
    setDocumentToView({
      url,
      name: note.documentName,
      type: note.documentType
    });
    setShowDocumentPreview(true);
  };
  
  // Initialize edit note form
  const openEditNoteDialog = (note: NoteType) => {
    setSelectedNote(note);
    setEditNoteText(note.text);
    setEditNoteCategory(note.category);
    setShowEditDialog(true);
  };
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            View and manage all your notes in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={useColoredCards ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setUseColoredCards(!useColoredCards)}
          >
            <Palette className="h-4 w-4" />
            {useColoredCards ? "Colored Cards" : "Plain Cards"}
          </Button>
          <Tabs 
            value={viewMode} 
            onValueChange={setViewMode}
            className="w-[240px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Notes</TabsTrigger>
              <TabsTrigger value="grouped">By Startup</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your notes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>
                  {categoryFilter === 'all' 
                    ? 'All Categories' 
                    : getCategoryLabel(categoryFilter)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('general')}
                  <span>General</span>
                </div>
              </SelectItem>
              <SelectItem value="strength">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('strength')}
                  <span>Strengths</span>
                </div>
              </SelectItem>
              <SelectItem value="weakness">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('weakness')}
                  <span>Weaknesses</span>
                </div>
              </SelectItem>
              <SelectItem value="question">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('question')}
                  <span>Questions</span>
                </div>
              </SelectItem>
              <SelectItem value="action">
                <div className="flex items-center gap-2">
                  {getCategoryIcon('action')}
                  <span>Action Items</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={startupFilter} onValueChange={setStartupFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>
                  {startupFilter === 'all' 
                    ? 'All Startups' 
                    : startups.find(s => s.id === startupFilter)?.name || 'All Startups'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Startups</SelectItem>
              {startups.map((startup) => (
                <SelectItem key={startup.id} value={startup.id}>
                  {startup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Sort By</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="startup">By Startup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-4">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm || categoryFilter !== 'all' || startupFilter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You haven't created any notes yet. Notes you take while reviewing documents will appear here."}
            </p>
          </div>
        ) : viewMode === 'all' ? (
          // All notes view - Masonry grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
            {filteredNotes.map(note => (
              <Card 
                key={note.id} 
                className={`overflow-hidden ${getNoteCardBorder(note.category)}`}
                style={{
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'fit-content'
                }}
              >
                <CardHeader className={`p-4 pb-0 flex flex-row items-center justify-between space-y-0 ${getNoteCardColor(note.category)}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {note.startupName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/committee-portal/assessments/${note.assessmentId}`}
                          className="font-medium hover:underline"
                        >
                          {note.startupName}
                        </Link>
                        <Badge variant="outline" className="ml-2">
                          {note.documentName}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(note.timestamp)}</span>
                        <Badge 
                          variant="secondary" 
                          className="flex items-center gap-1 px-2 py-0 h-5"
                        >
                          {getCategoryIcon(note.category)}
                          <span>{getCategoryLabel(note.category)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/committee-portal/assessments/${note.assessmentId}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Assessment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDocument(note)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Document
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openEditNoteDialog(note)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedNote(note);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className={`p-4 flex-grow ${getNoteCardColor(note.category)}`}>
                  <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                </CardContent>
                
                <CardFooter className="bg-muted/50 py-2 px-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      From document: {note.documentName}
                    </span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    asChild
                  >
                    <Link href={`/committee-portal/assessments/${note.assessmentId}`}>
                      View Assessment
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // Grouped by startup view
          <div className="space-y-10">
            {Object.entries(notesByStartup).map(([startupId, startup]) => (
              <div key={startupId} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {startup.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{startup.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {startup.notes.length} notes
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    asChild
                  >
                    <Link href={`/committee-portal/assessments?startup=${startupId}`}>
                      View Assessments
                    </Link>
                  </Button>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 gap-4 pl-6 border-l-2 border-muted">
                  {startup.notes.map(note => (
                    <Card 
                      key={note.id} 
                      className={`overflow-hidden ${getNoteCardBorder(note.category)}`}
                    >
                      <CardHeader className={`p-4 pb-0 flex flex-row items-center justify-between space-y-0 ${getNoteCardColor(note.category)}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {note.documentName}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className="flex items-center gap-1 px-2 py-0 h-5"
                            >
                              {getCategoryIcon(note.category)}
                              <span>{getCategoryLabel(note.category)}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(note.timestamp)}</span>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/committee-portal/assessments/${note.assessmentId}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Assessment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDocument(note)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditNoteDialog(note)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedNote(note);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      
                      <CardContent className={`p-4 ${getNoteCardColor(note.category)}`}>
                        <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedNote && (
            <div className="my-4 p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(selectedNote.category)}
                <span className="text-sm font-medium">{getCategoryLabel(selectedNote.category)}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(selectedNote.timestamp)}
                </span>
              </div>
              <p className="text-sm line-clamp-3">{selectedNote.text}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote} disabled={isProcessing}>
              {isProcessing ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit note dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note content or category.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
              <Select
                value={editNoteCategory}
                onValueChange={setEditNoteCategory}
              >
                <SelectTrigger id="edit-category">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(editNoteCategory)}
                    <span>{getCategoryLabel(editNoteCategory)}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('general')}
                      <span>General</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="strength">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('strength')}
                      <span>Strength</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weakness">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('weakness')}
                      <span>Weakness</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="question">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('question')}
                      <span>Question</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="action">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon('action')}
                      <span>Action Item</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-note-text" className="text-sm font-medium">Note Text</label>
              <textarea
                id="edit-note-text"
                className="w-full min-h-[150px] p-2 border rounded-md"
                value={editNoteText}
                onChange={(e) => setEditNoteText(e.target.value)}
                placeholder="Enter your note text..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditNote} 
              disabled={isProcessing || !editNoteText.trim()}
            >
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document preview dialog */}
      <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{documentToView?.name || 'Document Preview'}</DialogTitle>
            <DialogDescription>
              Viewing document from assessment
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 h-[calc(80vh-120px)] overflow-hidden rounded-md border bg-muted">
            {documentToView?.type.includes('pdf') ? (
              <object
                data={documentToView.url}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="w-full h-full flex items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">
                    Unable to display PDF. Please 
                    <a href={documentToView.url} target="_blank" rel="noopener noreferrer" className="text-primary underline mx-1">
                      open in new tab
                    </a> 
                    or download.
                  </p>
                </div>
              </object>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p>This document type cannot be previewed.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              asChild
            >
              <a href={documentToView?.url} download target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
            <Button onClick={() => setShowDocumentPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
