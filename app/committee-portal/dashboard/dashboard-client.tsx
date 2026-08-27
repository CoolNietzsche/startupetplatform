"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  ArrowUpDown, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  MessageCircle,
  Loader2
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AssessmentResultModal } from './components/assessment-result-modal';
import { startAssessmentReview } from './actions';
import { initCommitteeChatWithStartup } from '@/lib/actions/communication';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  committees: any[];
  pendingAssessments: any[];
  underReviewAssessments: any[];
  completedAssessments: any[];
  upcomingMeetings: any[];
}

export function DashboardClient({
  committees = [],
  pendingAssessments = [],
  underReviewAssessments = [],
  completedAssessments = [],
  upcomingMeetings = []
}: DashboardClientProps) {
  const [tabView, setTabView] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [startingReview, setStartingReview] = useState<string | null>(null);
  const [initiatingChat, setInitiatingChat] = useState<string | null>(null);
  const router = useRouter();

  const handleStartReview = async (assessment: any) => {
    setStartingReview(assessment.id);
    try {
      const result = await startAssessmentReview(assessment.id, assessment.entityType);
      if (result.success) {
        router.push(getAssessmentLink(assessment));
      } else {
        toast.error(result.message || "Failed to start review");
      }
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setStartingReview(null);
    }
  };

  const handleSeeResult = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsResultModalOpen(true);
  };

  const handleInitiateChat = async (entityId: string, entityType: "startup" | "ecosystem") => {
    setInitiatingChat(entityId);
    try {
      const res = await initCommitteeChatWithStartup(entityId, entityType);
      if (res.success && res.data?.conversationId) {
        router.push(`/committee-portal/messages?conversationId=${res.data.conversationId}`);
      } else {
        toast.error(res.error || "Failed to initiate chat");
      }
    } catch (error) {
      toast.error("An error occurred while opening chat");
    } finally {
      setInitiatingChat(null);
    }
  };
  
  const filteredPendingAssessments = pendingAssessments.filter(assessment => {
    const matchesSearch = assessment.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCommittee = committeeFilter === 'all' || assessment.committeeId === committeeFilter;
    
    return matchesSearch && matchesCommittee;
  });
  
  const filteredUnderReviewAssessments = underReviewAssessments.filter(assessment => {
    const matchesSearch = assessment.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCommittee = committeeFilter === 'all' || assessment.committeeId === committeeFilter;
    
    return matchesSearch && matchesCommittee;
  });
  
  const filteredCompletedAssessments = completedAssessments.filter(assessment => {
    const matchesSearch = assessment.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCommittee = committeeFilter === 'all' || assessment.committeeId === committeeFilter;
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    
    return matchesSearch && matchesCommittee && matchesStatus;
  });
  
  // Calculate days remaining until due date
  const getDaysRemaining = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Format date with time for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const startupCount = pendingAssessments.filter(a => a.entityType === 'startup').length + underReviewAssessments.filter(a => a.entityType === 'startup').length;
  const ecosystemCount = pendingAssessments.filter(a => a.entityType === 'ecosystem').length + underReviewAssessments.filter(a => a.entityType === 'ecosystem').length;

  const getAssessmentLink = (assessment: any) => {
    return `/committee-portal/assessments/${assessment.entityType}/${assessment.id}`;
  };
  
  return (
    <div className="container py-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Committee Assessment Portal</h1>
          <p className="text-muted-foreground">Welcome back! You have {pendingAssessments.length} applications pending action.</p>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReviewAssessments.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
              {underReviewAssessments.filter(a => a.entityType === 'startup').length} Startup • {underReviewAssessments.filter(a => a.entityType === 'ecosystem').length} Eco
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssessments.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {completedAssessments.filter(a => a.entityType === 'startup').length} Startup • {completedAssessments.filter(a => a.entityType === 'ecosystem').length} Eco
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Committee Memberships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{committees.length}</div>
            <p className="text-xs text-muted-foreground">
              Active committees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              Next: {upcomingMeetings[0] ? formatDate(upcomingMeetings[0]?.date) : 'None'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content tabs */}
      <Tabs value={tabView} onValueChange={setTabView} className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg">Pending</TabsTrigger>
            <TabsTrigger value="underReview" className="rounded-lg">Under Review</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
            <TabsTrigger value="committees" className="rounded-lg">My Committees</TabsTrigger>
            <TabsTrigger value="meetings" className="rounded-lg">Meetings</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border-2 border-slate-100 shadow-sm">
             <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="font-bold text-xs h-8 px-4 rounded-lg hover:bg-white hover:shadow-sm transition-all"
             >
                <Link href="/committee-portal/assessments/startup">Startup Applications ({pendingAssessments.filter(a => a.entityType === 'startup').length})</Link>
             </Button>
             <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
             <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="font-bold text-xs h-8 px-4 rounded-lg hover:bg-white hover:shadow-sm transition-all text-indigo-700"
             >
                <Link href="/committee-portal/assessments/ecosystem">Ecosystem Builder Applications ({pendingAssessments.filter(a => a.entityType === 'ecosystem').length})</Link>
             </Button>
          </div>
        </div>
        
        {/* Pending Assessments Tab */}
        <TabsContent value="pending">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assessments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter by committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Committees</SelectItem>
                  {committees.map(committee => (
                    <SelectItem key={committee.id} value={committee.id}>
                      {committee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPendingAssessments.length > 0 ? (
                    filteredPendingAssessments.map(assessment => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {assessment.entityLogo ? (
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={assessment.entityLogo} alt={assessment.entityName} />
                              </Avatar>
                            ) : (
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-primary/10">
                                  {assessment.entityName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span>{assessment.entityName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {assessment.entityType === 'startup' ? 'Startup' : 'Ecosystem Builder'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {assessment.sector}
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                             Assigned
                           </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{assessment.committeeName}</TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{assessment.completedVotes}/{assessment.requiredVotes}</span>
                              <span>{Math.round((assessment.completedVotes / assessment.requiredVotes) * 100)}%</span>
                            </div>
                            <Progress value={(assessment.completedVotes / assessment.requiredVotes) * 100} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm font-medium">{formatDate(assessment.dueDate)}</div>
                          {getDaysRemaining(assessment.dueDate) === 0 ? (
                            <Badge variant="destructive" className="mt-1 text-xs">Overdue</Badge>
                          ) : getDaysRemaining(assessment.dueDate) <= 5 ? (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              {getDaysRemaining(assessment.dueDate)}d left
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{getDaysRemaining(assessment.dueDate)}d left</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{formatDate(assessment.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleStartReview(assessment)}
                            disabled={startingReview === assessment.id}
                          >
                            {startingReview === assessment.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              "Start Review"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 ml-2 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => handleInitiateChat(assessment.id, assessment.entityType)}
                            disabled={initiatingChat === assessment.id}
                            title="Message Applicant"
                          >
                            {initiatingChat === assessment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        No pending assessments match the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Under Review Assessments Tab */}
        <TabsContent value="underReview">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search under review..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnderReviewAssessments.length > 0 ? (
                    filteredUnderReviewAssessments.map(assessment => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {assessment.entityLogo ? (
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={assessment.entityLogo} alt={assessment.entityName} />
                              </Avatar>
                            ) : (
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-primary/10">
                                  {assessment.entityName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span>{assessment.entityName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {assessment.entityType === 'startup' ? 'Startup' : 'Ecosystem Builder'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-100">
                             Reviewing
                           </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{assessment.committeeName}</TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{assessment.completedVotes}/{assessment.requiredVotes}</span>
                            </div>
                            <Progress value={(assessment.completedVotes / assessment.requiredVotes) * 100} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-sm">
                          {formatDate(assessment.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={getAssessmentLink(assessment)}>
                              Continue
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 ml-2 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => handleInitiateChat(assessment.id, assessment.entityType)}
                            disabled={initiatingChat === assessment.id}
                            title="Message Applicant"
                          >
                            {initiatingChat === assessment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No assessments in review
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Completed Assessments Tab */}
        <TabsContent value="completed">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assessments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter by committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Committees</SelectItem>
                  {committees.map(committee => (
                    <SelectItem key={committee.id} value={committee.id}>
                      {committee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="more-info">More Info Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Your Rating</TableHead>
                    <TableHead>Total Valuation</TableHead>
                    <TableHead>Verdict</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompletedAssessments.length > 0 ? (
                    filteredCompletedAssessments.map(assessment => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {assessment.entityLogo ? (
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={assessment.entityLogo} alt={assessment.entityName} />
                              </Avatar>
                            ) : (
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs bg-primary/10">
                                  {assessment.entityName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span>{assessment.entityName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {assessment.entityType === 'startup' ? 'Startup' : 'Ecosystem Builder'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {assessment.sector}
                        </TableCell>
                        <TableCell className="text-sm">{assessment.committeeName}</TableCell>
                        <TableCell>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-amber-500">{(assessment.yourScore ?? 0).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">/5.0</span>
                          </div>
                          <span className="text-xs text-muted-foreground block">
                            Avg: {(assessment.avgScore ?? 0).toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-primary">{assessment.yourTotalValuation}</span>
                            <span className="text-xs text-muted-foreground">pts</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assessment.status === 'approve' && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 whitespace-nowrap">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {assessment.status === 'reject' && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 whitespace-nowrap">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          {assessment.status === 'more-info' && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap">
                              <HelpCircle className="h-3 w-3 mr-1" />
                              More Info
                            </Badge>
                          )}
                          {!['approve','reject','more-info'].includes(assessment.status) && (
                            <Badge variant="outline" className="whitespace-nowrap">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(assessment.submittedDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleSeeResult(assessment.id)}>
                              See Result
                            </Button>
                            <Button variant="outline" asChild size="sm">
                              <Link href={getAssessmentLink(assessment)}>
                                View
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0 ml-1 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              onClick={() => handleInitiateChat(assessment.id, assessment.entityType)}
                              disabled={initiatingChat === assessment.id}
                              title="Message Applicant"
                            >
                              {initiatingChat === assessment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                        No completed assessments match the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* My Committees Tab */}
        <TabsContent value="committees">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {committees.map(committee => (
              <Card key={committee.id}>
                <CardHeader>
                  <CardTitle>{committee.name}</CardTitle>
                  <CardDescription>
                    {committee.members} members
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Assessments</span>
                      <Badge variant="outline">{committee.activeAssessments}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed Assessments</span>
                      <Badge variant="outline">{committee.completedAssessments}</Badge>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/committee-portal/committees/${committee.id}`}>
                      View Committee
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Upcoming Meetings Tab */}
        <TabsContent value="meetings">
          <div className="space-y-6">
            {upcomingMeetings.map(meeting => (
              <Card key={meeting.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-primary/10 md:w-48 p-6 flex flex-col justify-center items-center text-center">
                    <div className="text-3xl font-bold">{new Date(meeting.date).getDate()}</div>
                    <div className="text-lg">{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(meeting.date))}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date(meeting.date))}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {meeting.duration} minutes
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold">{meeting.title}</h3>
                      <div className="text-sm text-muted-foreground">{meeting.committeeName}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                        <p>{meeting.location}</p>
                      </div>
                      
                      {meeting.link && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Meeting Link</h4>
                          <a 
                            href={meeting.link}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {meeting.link}
                          </a>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Agenda</h4>
                        <p>{meeting.agenda}</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
                
                <Separator />
                
                <CardFooter className="p-4 flex justify-end">
                  <Button variant="outline" className="mr-2">
                    Add to Calendar
                  </Button>
                  {meeting.link && (
                    <Button>
                      Join Meeting
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            {upcomingMeetings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming meetings scheduled
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AssessmentResultModal 
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        applicationId={selectedApplicationId}
      />
    </div>
  );
}
