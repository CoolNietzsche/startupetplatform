"use client";

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Download, 
  Search, 
  Plus,
  ChevronDown,
  Check,
  Filter
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

// Sample meetings data
const UPCOMING_MEETINGS = [
  {
    id: 'M1001',
    title: 'Weekly Committee Sync',
    committeeId: 'C1001',
    committeeName: 'Startup Assessment Committee',
    date: '2025-05-05T14:00:00',
    duration: 60, // minutes
    location: 'ICE Addis, Meeting Room 3',
    link: 'https://meet.google.com/abc-defg-hij',
    agenda: 'Review pending assessments, discuss assessment criteria updates, plan for upcoming applications',
    attendees: [
      { id: 'U1001', name: 'Sarah Johnson', role: 'chair', attending: 'yes', avatar: '' },
      { id: 'U1002', name: 'Michael Chen', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1003', name: 'John Doe', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1004', name: 'Abebe Bekele', role: 'member', attending: 'maybe', avatar: '' },
      { id: 'U1005', name: 'Tigist Hailu', role: 'member', attending: 'no', avatar: '' },
    ],
    documents: [
      { id: 'D1001', name: 'Meeting Agenda', type: 'application/pdf', url: '#' },
      { id: 'D1002', name: 'Previous Meeting Minutes', type: 'application/pdf', url: '#' },
    ]
  },
  {
    id: 'M1002',
    title: 'Innovation & Technology Committee Review',
    committeeId: 'C1003',
    committeeName: 'Innovation & Technology Committee',
    date: '2025-05-10T10:00:00',
    duration: 90, // minutes
    location: 'Virtual',
    link: 'https://zoom.us/j/123456789',
    agenda: 'Deep dive into tech startups, innovation trends in Ethiopia, and scoring methodology alignment',
    attendees: [
      { id: 'U1012', name: 'Maya Wong', role: 'chair', attending: 'yes', avatar: '' },
      { id: 'U1003', name: 'John Doe', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1013', name: 'Fikru Tadesse', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1014', name: 'Rahel Solomon', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1015', name: 'Emma Johnson', role: 'member', attending: 'maybe', avatar: '' },
    ],
    documents: [
      { id: 'D1003', name: 'Meeting Agenda', type: 'application/pdf', url: '#' },
      { id: 'D1004', name: 'Tech Innovation Report 2025', type: 'application/pdf', url: '#' },
    ]
  },
  {
    id: 'M1003',
    title: 'Ecosystem Builder Committee Monthly Review',
    committeeId: 'C1002',
    committeeName: 'Ecosystem Builder Committee',
    date: '2025-05-15T15:30:00',
    duration: 120, // minutes
    location: 'Hyatt Regency, Conference Room B',
    link: '',
    agenda: 'Monthly review of ecosystem builder applications, discussion of ecosystem mapping progress, and coordination with other committees',
    attendees: [
      { id: 'U1003', name: 'John Doe', role: 'chair', attending: 'yes', avatar: '' },
      { id: 'U1008', name: 'Kidist Tesfaye', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1009', name: 'Robert Garcia', role: 'member', attending: 'maybe', avatar: '' },
      { id: 'U1010', name: 'Fatima Ali', role: 'member', attending: 'yes', avatar: '' },
      { id: 'U1011', name: 'Dawit Mekonnen', role: 'member', attending: 'no', avatar: '' },
    ],
    documents: [
      { id: 'D1005', name: 'Meeting Agenda', type: 'application/pdf', url: '#' },
      { id: 'D1006', name: 'Ecosystem Builder Assessment Template', type: 'application/pdf', url: '#' },
    ]
  }
];

const PAST_MEETINGS = [
  {
    id: 'M0995',
    title: 'Startup Assessment Committee Weekly Sync',
    committeeId: 'C1001',
    committeeName: 'Startup Assessment Committee',
    date: '2025-04-28T14:00:00',
    duration: 60,
    location: 'ICE Addis, Meeting Room 3',
    link: 'https://meet.google.com/abc-defg-hij',
    attendance: 4, // number of attendees
    documents: [
      { id: 'D0995', name: 'Meeting Minutes', type: 'application/pdf', url: '#' },
      { id: 'D0996', name: 'Action Items', type: 'application/pdf', url: '#' },
    ]
  },
  {
    id: 'M0990',
    title: 'Ecosystem Builder Committee Monthly Review',
    committeeId: 'C1002',
    committeeName: 'Ecosystem Builder Committee',
    date: '2025-04-15T15:30:00',
    duration: 120,
    location: 'Hyatt Regency, Conference Room B',
    link: '',
    attendance: 5,
    documents: [
      { id: 'D0990', name: 'Meeting Minutes', type: 'application/pdf', url: '#' },
      { id: 'D0991', name: 'Assessment Reviews Summary', type: 'application/pdf', url: '#' },
    ]
  }
];

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [meetingType, setMeetingType] = useState('online');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [captureAll, setCaptureAll] = useState(true);
  
  // New meeting form state
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [meetingLanguage, setMeetingLanguage] = useState('English');
  
  // Filter meetings based on search and committee filter
  const filteredUpcomingMeetings = UPCOMING_MEETINGS.filter(meeting => {
    const matchesSearch = searchQuery === '' || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.committeeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCommittee = committeeFilter === 'all' || meeting.committeeId === committeeFilter;
    
    return matchesSearch && matchesCommittee;
  });
  
  const filteredPastMeetings = PAST_MEETINGS.filter(meeting => {
    const matchesSearch = searchQuery === '' || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.committeeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCommittee = committeeFilter === 'all' || meeting.committeeId === committeeFilter;
    
    return matchesSearch && matchesCommittee;
  });
  
  // Define committee type
  type Committee = {
    id: string;
    name: string;
  };

  // Get unique committees for filter dropdown
  const committeeItems = [
    ...UPCOMING_MEETINGS.map(m => ({ id: m.committeeId, name: m.committeeName })),
    ...PAST_MEETINGS.map(m => ({ id: m.committeeId, name: m.committeeName }))
  ];
  
  const uniqueCommitteeStrings = Array.from(
    new Set(committeeItems.map(c => JSON.stringify(c)))
  );
  
  const committees: Committee[] = uniqueCommitteeStrings
    .map(c => JSON.parse(c) as Committee)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  // Get meetings for today (for Today panel)
  const getTodayMeetings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    return UPCOMING_MEETINGS.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= today && meetingDate <= todayEnd;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  // Format time range (11:00 AM - 11:45 AM)
  const formatTimeRange = (dateString: string, durationMinutes: number) => {
    const startDate = new Date(dateString);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    return `${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(startDate)} - ${new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(endDate)}`;
  };
  
  // Handle create meeting
  const handleCreateMeeting = () => {
    // Reset form
    setMeetingUrl('');
    setMeetingName('');
    setShowNewMeetingForm(false);
    
    // Show success message
    toast.success('Meeting created successfully!');
  };
  
  const todayMeetings = getTodayMeetings();
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3 space-y-8">
          {/* Header and Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Committee Meetings</h1>
              <p className="text-muted-foreground">
                Schedule, manage, and track all your committee meetings
              </p>
            </div>
            <Button onClick={() => setShowNewMeetingForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
            </Button>
          </div>
          
          {/* New Meeting Form */}
          {showNewMeetingForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>New meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Tabs defaultValue="online" onValueChange={setMeetingType}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="online" className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Online meeting</span>
                      </TabsTrigger>
                      <TabsTrigger value="in-person" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>In-person meeting</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="online" className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Meeting URL</label>
                        <Input
                          value={meetingUrl}
                          onChange={(e) => setMeetingUrl(e.target.value)}
                          placeholder="Paste your meeting URL here"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span>Works with:</span>
                        <span className="inline-flex items-center">
                          <Video className="h-4 w-4 text-blue-500" />
                          <span className="ml-1">Google Meet</span>
                        </span>
                        <span className="inline-flex items-center ml-2">
                          <Video className="h-4 w-4 text-blue-400" />
                          <span className="ml-1">MS Teams</span>
                        </span>
                        <span className="inline-flex items-center ml-2">
                          <Video className="h-4 w-4 text-blue-600" />
                          <span className="ml-1">Zoom</span>
                        </span>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="in-person" className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meeting Location</label>
                          <Input placeholder="Enter meeting location" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date & Time</label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attendees</label>
                        <Input placeholder="Enter attendee emails (comma separated)" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name your meeting <span className="text-muted-foreground">(optional)</span></label>
                    <Input 
                      placeholder="E.g. Team Sync" 
                      value={meetingName}
                      onChange={(e) => setMeetingName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meeting language</label>
                    <Select value={meetingLanguage} onValueChange={setMeetingLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Amharic">Amharic</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowNewMeetingForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMeeting} disabled={meetingType === 'online' && !meetingUrl.trim()}>
                  Create Meeting
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Filter and Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search meetings..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>
                          {committeeFilter === 'all' 
                            ? 'All Committees' 
                            : committees.find(c => c.id === committeeFilter)?.name}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[240px]">
                    <DropdownMenuItem
                      onClick={() => setCommitteeFilter('all')}
                      className="flex items-center gap-2"
                    >
                      {committeeFilter === 'all' && <Check className="h-4 w-4" />}
                      <span className={committeeFilter === 'all' ? 'font-medium' : ''}>All Committees</span>
                    </DropdownMenuItem>
                    
                    {committees.map(committee => (
                      <DropdownMenuItem
                        key={committee.id}
                        onClick={() => setCommitteeFilter(committee.id)}
                        className="flex items-center gap-2"
                      >
                        {committeeFilter === committee.id && <Check className="h-4 w-4" />}
                        <span className={committeeFilter === committee.id ? 'font-medium' : ''}>
                          {committee.name}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
                <TabsTrigger value="past">Past Meetings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Meeting Lists */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              {filteredUpcomingMeetings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming meetings</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      {searchQuery || committeeFilter !== 'all'
                        ? "No meetings match your search criteria. Try adjusting your filters."
                        : "You don&apos;t have any upcoming committee meetings scheduled. Create a new meeting to get started."}
                    </p>
                    <Button className="mt-4" onClick={() => setShowNewMeetingForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Meeting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1">
                  {filteredUpcomingMeetings.map(meeting => (
                    <Card key={meeting.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">{meeting.title}</CardTitle>
                            <CardDescription>{formatDate(meeting.date)} at {formatTime(meeting.date)}</CardDescription>
                          </div>
                          <Badge variant="outline">{meeting.committeeName}</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-sm">{meeting.duration} minutes</div>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-sm">{meeting.location}</div>
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-sm">{meeting.attendees.length} attendees</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Agenda</h4>
                          <p className="text-sm text-muted-foreground">{meeting.agenda}</p>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-0">
                        <div className="flex flex-wrap gap-2">
                          {meeting.documents.map(doc => (
                            <Button key={doc.id} variant="outline" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                {doc.name}
                              </a>
                            </Button>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Add to Calendar
                          </Button>
                          {meeting.link && (
                            <Button size="sm" asChild>
                              <a href={meeting.link} target="_blank" rel="noopener noreferrer">
                                <Video className="h-4 w-4 mr-2" />
                                Join Meeting
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Past Meetings content goes here */}
          {activeTab === 'past' && (
            <div className="space-y-6">
              {filteredPastMeetings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No past meetings found</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      {searchQuery || committeeFilter !== 'all'
                        ? "No meetings match your search criteria. Try adjusting your filters."
                        : "There are no recorded past committee meetings."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredPastMeetings.map(meeting => (
                    <Card key={meeting.id}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <CardTitle>{meeting.title}</CardTitle>
                            <CardDescription>{formatDate(meeting.date)} at {formatTime(meeting.date)}</CardDescription>
                          </div>
                          <Badge variant="outline">{meeting.committeeName}</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-sm">{meeting.duration} minutes</div>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-sm">{meeting.location}</div>
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="text-sm">{meeting.attendance} attendees</div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-0">
                        <div className="flex gap-2">
                          {meeting.documents.map(doc => (
                            <Button key={doc.id} variant="outline" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                {doc.name}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Today Panel */}
        <div className="w-full md:w-1/3">
          <Card className="sticky top-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today</CardTitle>
              <Button size="icon" variant="ghost">
                <CalendarIcon className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Meetings</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-2 h-7 px-2 text-sm">
                      <span>Capture all</span>
                      <Switch 
                        checked={captureAll} 
                        onChange={(checked) => {
                          if (typeof checked === 'boolean') setCaptureAll(checked);
                        }} 
                      />
                    </div>
                  </div>
                </div>
                
                {todayMeetings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No meetings scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayMeetings.map(meeting => (
                      <div key={meeting.id} className="rounded-md border p-3">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <Switch checked={true} />
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeRange(meeting.date, meeting.duration)}</span>
                          <div className="flex ml-auto gap-1">
                            {meeting.link ? <Video className="h-4 w-4 text-blue-500" /> : null}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {meeting.attendees[0]?.name?.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{meeting.attendees[0]?.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">To do</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="task-1" />
                    <label htmlFor="task-1" className="text-sm leading-none">
                      Prepare committee assessment guidelines
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="task-2" />
                    <label htmlFor="task-2" className="text-sm leading-none">
                      Review pending startup applications
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="task-3" />
                    <label htmlFor="task-3" className="text-sm leading-none">
                      Coordinate with ecosystem partners
                    </label>
                  </div>
                </div>
                
                <div className="text-right mt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Go to Action items <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Custom Switch component
function Switch({ checked = false, onChange }: { checked?: boolean, onChange?: (checked: boolean) => void }) {
  const [isChecked, setIsChecked] = useState(checked);
  
  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onChange) onChange(newValue);
  };
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked ? "true" : "false"}
      title={isChecked ? "Turn off" : "Turn on"}
      aria-label={isChecked ? "Enabled" : "Disabled"}
      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isChecked ? 'bg-primary' : 'bg-gray-200'
      }`}
      onClick={handleToggle}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isChecked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
