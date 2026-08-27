"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  DownloadCloud,
  File,
  FileText,
  Grid,
  List,
  MoreVertical,
  Search,
  Star,
  Trash2,
  Upload,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Define proper TypeScript interfaces
interface Document {
  id: string;
  title: string;
  type: string;
  format: string;
  dateUploaded: string;
  expiry: string | null;
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  size: string;
  associatedWith: string;
  downloadUrl: string;
}

interface Requirement {
  id: string;
  title: string;
  deadline: string;
  associatedWith: string;
  status: 'normal' | 'urgent';
}

interface StatusInfo {
  label: string;
  color: string;
}

interface StatusMap {
  verified: StatusInfo;
  pending: StatusInfo;
  rejected: StatusInfo;
  expired: StatusInfo;
  [key: string]: StatusInfo;
}

// Mock data for documents
const documents: Document[] = [
  {
    id: "doc1",
    title: "Business Registration Certificate",
    type: "registration",
    format: "PDF",
    dateUploaded: "2025-01-15",
    expiry: "2026-01-15",
    status: "verified",
    size: "1.2 MB",
    associatedWith: "Business Registration",
    downloadUrl: "#"
  },
  {
    id: "doc2",
    title: "Tax Identification Certificate",
    type: "tax",
    format: "PDF",
    dateUploaded: "2025-01-15",
    expiry: "2026-01-15",
    status: "verified",
    size: "0.8 MB",
    associatedWith: "Tax Registration",
    downloadUrl: "#"
  },
  {
    id: "doc3",
    title: "Investment Permit",
    type: "registration",
    format: "PDF",
    dateUploaded: "2025-02-10",
    expiry: "2026-02-10",
    status: "pending",
    size: "1.5 MB",
    associatedWith: "Investment Approval",
    downloadUrl: "#"
  },
  {
    id: "doc4",
    title: "Prototype Demonstration Video",
    type: "product",
    format: "MP4",
    dateUploaded: "2025-03-01",
    expiry: null,
    status: "verified",
    size: "15.4 MB",
    associatedWith: "Innovation Fund Application",
    downloadUrl: "#"
  },
  {
    id: "doc5",
    title: "Financial Statements - 2024",
    type: "financial",
    format: "PDF",
    dateUploaded: "2025-02-28",
    expiry: null,
    status: "verified",
    size: "2.3 MB",
    associatedWith: "Annual Reporting",
    downloadUrl: "#"
  },
  {
    id: "doc6",
    title: "Pitch Deck - Seed Round",
    type: "investment",
    format: "PPTX",
    dateUploaded: "2025-04-01",
    expiry: null,
    status: "verified",
    size: "5.7 MB",
    associatedWith: "Investor Relations",
    downloadUrl: "#"
  },
  {
    id: "doc7",
    title: "Team Structure and Credentials",
    type: "team",
    format: "PDF",
    dateUploaded: "2025-01-20",
    expiry: null,
    status: "verified",
    size: "3.1 MB",
    associatedWith: "Startup Growth Program",
    downloadUrl: "#"
  },
  {
    id: "doc8",
    title: "Intellectual Property Registration",
    type: "legal",
    format: "PDF",
    dateUploaded: "2025-03-15",
    expiry: "2030-03-15",
    status: "pending",
    size: "1.8 MB",
    associatedWith: "IP Protection",
    downloadUrl: "#"
  },
  {
    id: "doc9",
    title: "Partnership Agreement - XYZ Corp",
    type: "legal",
    format: "PDF",
    dateUploaded: "2025-02-05",
    expiry: "2027-02-05",
    status: "verified",
    size: "4.2 MB",
    associatedWith: "Business Development",
    downloadUrl: "#"
  },
  {
    id: "doc10",
    title: "Market Research Report",
    type: "research",
    format: "PDF",
    dateUploaded: "2025-03-10",
    expiry: null,
    status: "verified",
    size: "8.5 MB",
    associatedWith: "Business Strategy",
    downloadUrl: "#"
  },
  {
    id: "doc11",
    title: "Product Certification",
    type: "product",
    format: "PDF",
    dateUploaded: "2025-02-18",
    expiry: "2026-02-18",
    status: "verified",
    size: "1.1 MB",
    associatedWith: "Product Development",
    downloadUrl: "#"
  },
  {
    id: "doc12",
    title: "Business Plan - 2025",
    type: "business",
    format: "PDF",
    dateUploaded: "2025-01-05",
    expiry: null,
    status: "verified",
    size: "6.3 MB",
    associatedWith: "Business Strategy",
    downloadUrl: "#"
  },
];

// Document categories
const documentCategories = [
  { id: "all", label: "All Documents" },
  { id: "registration", label: "Registration" },
  { id: "tax", label: "Tax" },
  { id: "financial", label: "Financial" },
  { id: "legal", label: "Legal" },
  { id: "product", label: "Product" },
  { id: "investment", label: "Investment" },
  { id: "business", label: "Business" },
  { id: "team", label: "Team" },
  { id: "research", label: "Research" },
];

// Document status mapping
const statusMap: StatusMap = {
  verified: { label: "Verified", color: "bg-green-100 text-green-800" },
  pending: { label: "Pending Verification", color: "bg-yellow-100 text-yellow-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-800" },
};

// Document icon mapping
const formatIconMap: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-10 w-10 text-red-500" />,
  DOCX: <FileText className="h-10 w-10 text-blue-500" />,
  XLSX: <FileText className="h-10 w-10 text-green-500" />,
  PPTX: <FileText className="h-10 w-10 text-orange-500" />,
  MP4: <FileText className="h-10 w-10 text-purple-500" />,
  JPG: <FileText className="h-10 w-10 text-pink-500" />,
  PNG: <FileText className="h-10 w-10 text-teal-500" />,
};

// Upcoming document requirements
const upcomingRequirements: Requirement[] = [
  {
    id: "req1",
    title: "Annual Financial Statement",
    deadline: "June 30, 2025",
    associatedWith: "Ministry of Trade",
    status: "upcoming",
    description: "Annual financial statements for FY 2024-2025 as required by the Ethiopian Trade Registration and Licensing Agency."
  },
  {
    id: "req2",
    title: "Business License Renewal",
    deadline: "July 15, 2025",
    associatedWith: "Ministry of Trade",
    status: "upcoming",
    description: "Renewal of your business license for the fiscal year 2025-2026."
  },
  {
    id: "req3",
    title: "Tax Declaration",
    deadline: "May 10, 2025",
    associatedWith: "Ethiopian Revenue and Customs Authority",
    status: "urgent",
    description: "Quarterly tax declaration for Q1 2025."
  },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentFormData, setDocumentFormData] = useState({
    title: "",
    type: "",
    associatedWith: "",
    expiryDate: "",
  });
  const [docsList, setDocsList] = useState<Document[]>(documents);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [starredDocuments, setStarredDocuments] = useState<string[]>([]);
  
  // Filter documents based on search and category
  const filteredDocuments = docsList.filter(doc => {
    // Apply category filter
    const categoryMatch = selectedCategory === "all" || doc.type === selectedCategory;
    
    // Apply search filter (case insensitive)
    const searchMatch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.associatedWith.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDocumentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Function to simulate document upload
  const handleUpload = () => {
    if (!selectedFile || !documentFormData.title || !documentFormData.type) {
      toast.error("Please fill in required fields and select a file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadSuccess(true);
          
          // Add new document to list
          const newDoc: Document = {
            id: `doc${docsList.length + 1}`,
            title: documentFormData.title,
            type: documentFormData.type,
            format: selectedFile.name.split('.').pop()?.toUpperCase() || "PDF",
            dateUploaded: new Date().toISOString().split('T')[0],
            expiry: documentFormData.expiryDate || null,
            status: "pending",
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            associatedWith: documentFormData.associatedWith,
            downloadUrl: "#"
          };
          
          setDocsList(prev => [newDoc, ...prev]);
          
          // Reset form after successful upload
          setTimeout(() => {
            setUploadDialogOpen(false);
            setUploadSuccess(false);
            setSelectedFile(null);
            setDocumentFormData({
              title: "",
              type: "",
              associatedWith: "",
              expiryDate: "",
            });
          }, 2000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Function to simulate document download
  const handleDownload = (doc: Document, e?: React.MouseEvent) => {
    // Prevent default link behavior if event is provided
    if (e) {
      e.preventDefault();
    }
    
    // Create a simulated download effect
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = doc.title + '.' + doc.format.toLowerCase();
    
    // Append to body, click and remove (for browser compatibility)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  };

  // Handle document delete
  const handleDeleteDocument = (docId: string) => {
    setDocumentToDelete(docId);
    setShowDeleteConfirm(true);
  };
  
  // Confirm document deletion
  const confirmDelete = () => {
    if (documentToDelete) {
      setDocsList(prev => prev.filter(doc => doc.id !== documentToDelete));
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    }
  };
  
  // Toggle star status
  const toggleStar = (docId: string) => {
    setStarredDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };
  
  // Determine document status display
  const getStatusDisplay = (status: string) => {
    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  // Get icon for document format
  const getFormatIcon = (format: string) => {
    return formatIconMap[format] || <File className="h-10 w-10 text-gray-500" />;
  };
  
  // Handle document upload for upcoming requirements
  const handleRequirementUpload = (reqId: string) => {
    setDocumentFormData(prev => ({
      ...prev,
      title: upcomingRequirements.find(req => req.id === reqId)?.title || "",
      associatedWith: upcomingRequirements.find(req => req.id === reqId)?.associatedWith || "",
    }));
    setUploadDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-gray-500">
          Manage your business documents for registrations, applications, and regulatory compliance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Main content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle>My Documents</CardTitle>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
              <CardDescription>
                Documents you have uploaded for your startup registration, funding applications, and other processes
              </CardDescription>
              
              {/* Search and filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search documents..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                      className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No documents found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No matches for "${searchQuery}". Try a different search term.` 
                      : 'You have no documents in this category yet.'}
                  </p>
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                // Grid view
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map(doc => (
                    <div key={doc.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center">
                          {getFormatIcon(doc.format)}
                          <span className="ml-2 text-sm font-medium text-gray-500">{doc.format}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-full hover:bg-gray-200">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <DownloadCloud className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStar(doc.id)}>
                              <Star className={`h-4 w-4 mr-2 ${starredDocuments.includes(doc.id) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                              {starredDocuments.includes(doc.id) ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center">
                          <h3 className="font-medium mb-1 truncate flex-1" title={doc.title}>{doc.title}</h3>
                          {starredDocuments.includes(doc.id) && (
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span title={`Uploaded on ${doc.dateUploaded}`}>
                              Uploaded {doc.dateUploaded}
                            </span>
                          </div>
                          <div className="mt-1 truncate" title={`Associated with: ${doc.associatedWith}`}>
                            Associated with: {doc.associatedWith}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          {getStatusDisplay(doc.status)}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => handleDownload(doc, e)}
                          >
                            <DownloadCloud className="h-3.5 w-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List view
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-3 grid grid-cols-12 text-sm font-medium text-gray-500">
                    <div className="col-span-5">Document</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Uploaded</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  <div className="divide-y">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="px-4 py-3 grid grid-cols-12 items-center">
                        <div className="col-span-5 flex items-center">
                          <div className="mr-3">
                            {getFormatIcon(doc.format)}
                          </div>
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{doc.title}</div>
                              <div className="text-sm text-gray-500 truncate">{doc.associatedWith}</div>
                            </div>
                            {starredDocuments.includes(doc.id) && (
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-2 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 capitalize">{doc.type}</div>
                        <div className="col-span-2 text-sm">{doc.dateUploaded}</div>
                        <div className="col-span-2">{getStatusDisplay(doc.status)}</div>
                        <div className="col-span-1 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <DownloadCloud className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStar(doc.id)}>
                                <Star className={`h-4 w-4 mr-2 ${starredDocuments.includes(doc.id) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                                {starredDocuments.includes(doc.id) ? 'Unstar' : 'Star'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="md:col-span-1">
          {/* Document Categories */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {documentCategories.map(category => (
                  <button
                    key={category.id}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center ${
                      selectedCategory === category.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span>{category.label}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {docsList.filter(d => category.id === 'all' || d.type === category.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Requirements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Requirements</CardTitle>
              <CardDescription>Documents you&apos;ll need to submit soon</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {upcomingRequirements.map(req => (
                  <div key={req.id} className={`p-3 rounded-lg border ${
                    req.status === 'urgent' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start">
                      {req.status === 'urgent' ? (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      ) : (
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{req.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Due by {req.deadline}</p>
                        <p className="text-xs text-gray-500 mt-1">{req.associatedWith}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleRequirementUpload(req.id)}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Document upload dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to your business profile. Supported formats include PDF, DOCX, XLSX, and image files.
            </DialogDescription>
          </DialogHeader>
          
          {uploadSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Upload Complete!</h3>
              <p className="text-center text-gray-500">
                Your document has been successfully uploaded and is now being processed.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="document-title">Document Title</Label>
                  <Input 
                    id="document-title" 
                    name="title"
                    placeholder="Enter document title" 
                    value={documentFormData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select 
                    name="type" 
                    value={documentFormData.type}
                    onValueChange={(value) => setDocumentFormData(prev => ({...prev, type: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.filter(c => c.id !== 'all').map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="associated-with">Associated With</Label>
                  <Input 
                    id="associated-with" 
                    name="associatedWith"
                    placeholder="e.g., Business Registration, Funding Application" 
                    value={documentFormData.associatedWith}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Expiration Date (Optional)</Label>
                  <Input 
                    type="date" 
                    name="expiryDate"
                    value={documentFormData.expiryDate}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium">
                      {selectedFile ? selectedFile.name : "Drag files here"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {selectedFile 
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` 
                        : "or click to browse files"}
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        Select File
                      </Button>
                    </label>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
                
              <DialogFooter className="flex space-x-2 sm:justify-end">
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleUpload} disabled={isUploading || !selectedFile}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
