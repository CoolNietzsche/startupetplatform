"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Users, 
  ClipboardList,
  Calendar,
  ChevronRight
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface CommitteeCriterion {
  id: string;
  name: string;
  weight: number;
}

interface Committee {
  id: string;
  name: string;
  description: string;
  role: string;
  members: CommitteeMember[];
  pendingAssessments: number;
  completedAssessments: number;
  nextMeeting: string;
  criteria: CommitteeCriterion[];
  recentActivity: any[];
}

interface CommitteesClientProps {
  initialCommittees: Committee[];
  defaultCommitteeId?: string;
}

export function CommitteesClient({ initialCommittees, defaultCommitteeId }: CommitteesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommittee, setActiveCommittee] = useState(defaultCommitteeId || initialCommittees[0]?.id || '');

  // Filter committees based on search
  const filteredCommittees = initialCommittees.filter(committee => 
    committee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Selected committee details
  const selectedCommittee = initialCommittees.find(c => c.id === activeCommittee) || initialCommittees[0];

  // Helper date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not Scheduled";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  if (!initialCommittees || initialCommittees.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">My Committees</h1>
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Committees Found</h3>
            <p className="text-muted-foreground mt-2">You have not been assigned to any committees yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Committees</h1>
          <p className="text-muted-foreground">
            View and manage your committee memberships
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Committee List Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search committees..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            {filteredCommittees.map(committee => (
              <Card 
                key={committee.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${activeCommittee === committee.id ? 'border-primary' : ''}`}
                onClick={() => setActiveCommittee(committee.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{committee.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Badge variant={committee.role === 'chair' ? 'default' : 'outline'} className="text-xs mr-2">
                          {committee.role === 'chair' ? 'Chair' : 'Member'}
                        </Badge>
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{committee.members.length} members</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredCommittees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No committees found matching your search
              </div>
            )}
          </div>
        </div>
        
        {/* Committee Details */}
        <div className="md:col-span-2">
          {selectedCommittee && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedCommittee.name}</CardTitle>
                    <CardDescription>{selectedCommittee.description || "No description provided."}</CardDescription>
                  </div>
                  <Badge variant={selectedCommittee.role === 'chair' ? 'default' : 'outline'}>
                    {selectedCommittee.role === 'chair' ? 'Committee Chair' : 'Committee Member'}
                  </Badge>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="criteria">Assessment Criteria</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  </TabsList>
                  
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Assessments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pending</span>
                              <Badge variant="outline">{selectedCommittee.pendingAssessments}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Completed</span>
                              <Badge variant="outline">{selectedCommittee.completedAssessments}</Badge>
                            </div>
                            <div className="pt-2">
                              <Button variant="outline" className="w-full" asChild>
                                <Link href="/committee-portal/assessments">
                                  View All Assessments
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Next Meeting
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-2xl font-semibold">
                              {selectedCommittee.nextMeeting ? new Date(selectedCommittee.nextMeeting).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : "Not Scheduled"}
                            </div>
                            <div className="text-muted-foreground">
                              {selectedCommittee.nextMeeting ? new Date(selectedCommittee.nextMeeting).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }) : "No upcoming meetings"}
                            </div>
                            <div className="pt-4">
                              <Button variant="outline" className="w-full" asChild>
                                <Link href="/committee-portal/meetings">
                                  View All Meetings
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="sm:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Committee Members
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedCommittee.members.slice(0, 5).map(member => (
                              <div key={member.id} className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {member.name}
                                  {member.role === 'chair' && (
                                    <span className="ml-1 text-xs text-muted-foreground">(Chair)</span>
                                  )}
                                </span>
                              </div>
                            ))}
                            {selectedCommittee.members.length > 5 && (
                              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                                <span className="text-sm">+{selectedCommittee.members.length - 5} more</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* Members Tab */}
                  <TabsContent value="members" className="m-0">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead className="hidden sm:table-cell">Status</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedCommittee.members.map(member => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                      <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{member.name}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={member.role === 'chair' ? 'default' : 'outline'}>
                                    {member.role === 'chair' ? 'Chair' : 'Member'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Active
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">Contact</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Criteria Tab */}
                  <TabsContent value="criteria" className="m-0">
                    <Card>
                      <CardContent className="p-0">
                        {selectedCommittee.criteria.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Criteria</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedCommittee.criteria.map(criteria => (
                                <TableRow key={criteria.id}>
                                  <TableCell>
                                    <div className="font-medium">{criteria.name}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{criteria.weight}%</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">View Details</Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No assessment criteria defined for this committee.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Activity Tab */}
                  <TabsContent value="activity" className="m-0">
                    <Card>
                      <CardContent className="p-6">
                        {selectedCommittee.recentActivity && selectedCommittee.recentActivity.length > 0 ? (
                          <div className="space-y-8">
                            {selectedCommittee.recentActivity.map((activity, index) => (
                              <div key={index} className="relative pl-6 pb-8">
                                {/* Timeline connector */}
                                {index < selectedCommittee.recentActivity.length - 1 && (
                                  <div className="absolute left-2.5 top-2.5 bottom-0 w-0.5 bg-muted-foreground/20"></div>
                                )}
                                
                                {/* Activity dot */}
                                <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-primary bg-background"></div>
                                
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {getRelativeTime(activity.date)}
                                    </span>
                                  </div>
                                  <div className="font-medium mt-1">
                                    {activity.action}
                                  </div>
                                  <div className="text-sm">
                                    {activity.entity}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No recent activity found for this committee.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
