"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  HelpCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Sample assessment data
const ASSESSMENTS = [
  {
    id: 'A1001',
    entityType: 'startup',
    entityName: 'AgroConnect',
    entityLogo: '',
    sector: 'AgriTech',
    stage: 'Growth',
    committeeId: 'C1001',
    committeeName: 'Startup Assessment Committee',
    dueDate: '2025-04-30T23:59:59',
    status: 'in_progress',
    votesRequired: 8,
    votesReceived: 5,
    votesApproved: 4,
    votesRejected: 1,
    votesMoreInfo: 0,
    averageScore: 4.2,
    criteriaScores: [
      { name: 'Innovation Level', score: 4.6 },
      { name: 'Market Potential', score: 4.3 },
      { name: 'Team Capability', score: 3.8 },
      { name: 'Economic Impact', score: 4.2 },
      { name: 'Sustainability', score: 4.0 }
    ],
    createdAt: '2025-04-01T10:00:00',
  },
  {
    id: 'A1002',
    entityType: 'ecosystem',
    entityName: 'TechHub Addis',
    entityLogo: '',
    sector: 'Incubator',
    stage: 'Established',
    committeeId: 'C1002',
    committeeName: 'Ecosystem Builder Committee',
    dueDate: '2025-04-25T23:59:59',
    status: 'in_progress',
    votesRequired: 5,
    votesReceived: 2,
    votesApproved: 2,
    votesRejected: 0,
    votesMoreInfo: 0,
    averageScore: 4.5,
    criteriaScores: [
      { name: 'Ecosystem Impact', score: 4.8 },
      { name: 'Resources & Support', score: 4.3 },
      { name: 'Network Strength', score: 4.7 },
      { name: 'Track Record', score: 4.2 },
      { name: 'Sustainability', score: 4.5 }
    ],
    createdAt: '2025-04-05T11:30:00',
  },
  {
    id: 'A0991',
    entityType: 'startup',
    entityName: 'EduSmart',
    entityLogo: '',
    sector: 'EdTech',
    stage: 'Growth',
    committeeId: 'C1001',
    committeeName: 'Startup Assessment Committee',
    dueDate: '2025-03-15T23:59:59',
    status: 'completed',
    votesRequired: 8,
    votesReceived: 8,
    votesApproved: 7,
    votesRejected: 0,
    votesMoreInfo: 1,
    averageScore: 4.5,
    criteriaScores: [
      { name: 'Innovation Level', score: 4.7 },
      { name: 'Market Potential', score: 4.8 },
      { name: 'Team Capability', score: 4.2 },
      { name: 'Economic Impact', score: 4.4 },
      { name: 'Sustainability', score: 4.3 }
    ],
    createdAt: '2025-03-01T09:00:00',
    completedAt: '2025-03-18T15:20:00',
    finalStatus: 'approved'
  },
  {
    id: 'A0982',
    entityType: 'ecosystem',
    entityName: 'FinTech Association',
    entityLogo: '',
    sector: 'Industry Association',
    stage: 'Established',
    committeeId: 'C1002',
    committeeName: 'Ecosystem Builder Committee',
    dueDate: '2025-03-10T23:59:59',
    status: 'completed',
    votesRequired: 5,
    votesReceived: 5,
    votesApproved: 0,
    votesRejected: 4,
    votesMoreInfo: 1,
    averageScore: 2.1,
    criteriaScores: [
      { name: 'Ecosystem Impact', score: 2.4 },
      { name: 'Resources & Support', score: 2.0 },
      { name: 'Network Strength', score: 2.3 },
      { name: 'Track Record', score: 1.8 },
      { name: 'Sustainability', score: 2.0 }
    ],
    createdAt: '2025-02-20T14:30:00',
    completedAt: '2025-03-15T11:45:00',
    finalStatus: 'rejected'
  },
  {
    id: 'A0975',
    entityType: 'startup',
    entityName: 'LogisticsPro',
    entityLogo: '',
    sector: 'Logistics',
    stage: 'Early',
    committeeId: 'C1001',
    committeeName: 'Startup Assessment Committee',
    dueDate: '2025-03-05T23:59:59',
    status: 'completed',
    votesRequired: 8,
    votesReceived: 8,
    votesApproved: 3,
    votesRejected: 2,
    votesMoreInfo: 3,
    averageScore: 3.0,
    criteriaScores: [
      { name: 'Innovation Level', score: 3.2 },
      { name: 'Market Potential', score: 3.3 },
      { name: 'Team Capability', score: 2.7 },
      { name: 'Economic Impact', score: 3.1 },
      { name: 'Sustainability', score: 2.8 }
    ],
    createdAt: '2025-02-15T10:30:00',
    completedAt: '2025-03-10T16:15:00',
    finalStatus: 'more_info'
  }
];

// Sample committees
const COMMITTEES = [
  { id: 'C1001', name: 'Startup Assessment Committee' },
  { id: 'C1002', name: 'Ecosystem Builder Committee' },
  { id: 'C1003', name: 'Innovation & Technology Committee' },
  { id: 'C1004', name: 'Regional Development Committee' },
  { id: 'C1005', name: 'Financial Viability Committee' }
];

export default function AssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter assessments based on search and filters
  const filteredAssessments = ASSESSMENTS.filter(assessment => {
    const matchesSearch = assessment.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'in_progress' && assessment.status === 'in_progress') ||
                          (statusFilter === 'completed' && assessment.status === 'completed') ||
                          (statusFilter === 'approved' && assessment.finalStatus === 'approved') ||
                          (statusFilter === 'rejected' && assessment.finalStatus === 'rejected') ||
                          (statusFilter === 'more_info' && assessment.finalStatus === 'more_info');
    const matchesCommittee = committeeFilter === 'all' || assessment.committeeId === committeeFilter;
    const matchesEntityType = entityTypeFilter === 'all' || assessment.entityType === entityTypeFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'in_progress' && assessment.status === 'in_progress') ||
                      (activeTab === 'completed' && assessment.status === 'completed');
    
    return matchesSearch && matchesStatus && matchesCommittee && matchesEntityType && matchesTab;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Calculate days remaining or overdue
  const getDaysStatus = (dueDateString: string, status: string) => {
    if (status === 'completed') return null;
    
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), status: 'overdue' };
    }
    return { days: diffDays, status: 'remaining' };
  };
  
  // Get status badge variant and text
  const getStatusBadge = (assessment: any) => {
    if (assessment.status === 'in_progress') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    } else if (assessment.status === 'completed') {
      if (assessment.finalStatus === 'approved') {
        return (
          <Badge className="bg-green-100 text-green-800">
            <ThumbsUp className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      } else if (assessment.finalStatus === 'rejected') {
        return (
          <Badge className="bg-red-100 text-red-800">
            <ThumbsDown className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      } else if (assessment.finalStatus === 'more_info') {
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <HelpCircle className="h-3 w-3 mr-1" />
            More Info Needed
          </Badge>
        );
      }
    }
    
    return (
      <Badge variant="outline">
        Unknown
      </Badge>
    );
  };
  
  return (
    <div className="container py-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/admins-new/committees">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Committees
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Committee Assessments</h1>
            <p className="text-muted-foreground">View and manage all assessments conducted by committees</p>
          </div>
        </div>
        
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Assessments
        </Button>
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ASSESSMENTS.length}</div>
            <p className="text-xs text-muted-foreground">
              {ASSESSMENTS.filter(a => a.status === 'in_progress').length} in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Startups Assessed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ASSESSMENTS.filter(a => a.entityType === 'startup').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {ASSESSMENTS.filter(a => a.entityType === 'startup' && a.status === 'completed' && a.finalStatus === 'approved').length} approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Ecosystem Builders Assessed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ASSESSMENTS.filter(a => a.entityType === 'ecosystem').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {ASSESSMENTS.filter(a => a.entityType === 'ecosystem' && a.status === 'completed' && a.finalStatus === 'approved').length} approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Avg. Decision Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">
              From submission to final decision
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and filters */}
      <div className="space-y-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or sector..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-1 items-center gap-4 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="startup">Startups</SelectItem>
                <SelectItem value="ecosystem">Ecosystem Builders</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Committee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Committees</SelectItem>
                {COMMITTEES.map(committee => (
                  <SelectItem key={committee.id} value={committee.id}>
                    {committee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="more_info">More Info Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Assessments table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Committee</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map(assessment => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {assessment.entityLogo ? (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={assessment.entityLogo} alt={assessment.entityName} />
                          </Avatar>
                        ) : (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="text-xs bg-primary/10">
                              {assessment.entityName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-medium">{assessment.entityName}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {assessment.entityType === 'startup' ? 'Startup' : 'Ecosystem Builder'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {assessment.sector}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{assessment.committeeName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{assessment.votesReceived} of {assessment.votesRequired} votes</span>
                          <span>{Math.round((assessment.votesReceived / assessment.votesRequired) * 100)}%</span>
                        </div>
                        <Progress value={(assessment.votesReceived / assessment.votesRequired) * 100} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {assessment.averageScore ? (
                        <div className="text-center">
                          <span className={`text-lg font-bold ${
                            assessment.averageScore >= 4 ? 'text-green-600' : 
                            assessment.averageScore >= 3 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {assessment.averageScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">/5</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.status === 'completed' ? (
                        <>
                          <div className="flex gap-1 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1 text-green-600" />
                              <span>{assessment.votesApproved}</span>
                            </div>
                            <span>/</span>
                            <div className="flex items-center">
                              <ThumbsDown className="h-3 w-3 mr-1 text-red-600" />
                              <span>{assessment.votesRejected}</span>
                            </div>
                            <span>/</span>
                            <div className="flex items-center">
                              <HelpCircle className="h-3 w-3 mr-1 text-amber-600" />
                              <span>{assessment.votesMoreInfo}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assessment.status === 'completed' ? (
                        <div>
                          <div className="text-xs text-muted-foreground">Completed:</div>
                          <div>{formatDate(assessment.completedAt)}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs text-muted-foreground">Due:</div>
                          <div>{formatDate(assessment.dueDate)}</div>
                          {getDaysStatus(assessment.dueDate, assessment.status) && (
                            getDaysStatus(assessment.dueDate, assessment.status)?.status === 'overdue' ? (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                {getDaysStatus(assessment.dueDate, assessment.status)?.days} days overdue
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {getDaysStatus(assessment.dueDate, assessment.status)?.days} days left
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(assessment)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admins-new/committees/assessments/${assessment.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No assessments found matching the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
