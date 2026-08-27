"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Download, 
  Calendar,
  Check,
  Search,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

// Mock registered events data - would be fetched from API in production
const myEvents = [
  {
    id: "1",
    title: "Ethiopian Tech Summit 2025",
    date: "May 15, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Addis Ababa, Ethiopia",
    venue: "Skylight Hotel Conference Center",
    image: "/events/tech-summit.jpg",
    status: "Confirmed",
    ticketId: "ETH-TS-12345",
    registrationDate: "March 28, 2025"
  },
  {
    id: "3",
    title: "Women in Tech Ethiopia Meetup",
    date: "April 10, 2025",
    time: "4:00 PM - 7:00 PM",
    location: "Addis Ababa, Ethiopia",
    venue: "Hyatt Regency",
    image: "/events/women-tech.jpg",
    status: "Confirmed",
    ticketId: "WTE-25-6789",
    registrationDate: "March 15, 2025"
  },
  {
    id: "4",
    title: "Fintech Innovation Forum",
    date: "June 20, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Addis Ababa, Ethiopia",
    venue: "Capital Hotel",
    image: "/events/fintech-forum.jpg",
    status: "Waitlisted",
    ticketId: "FIF-25-8732",
    registrationDate: "March 30, 2025"
  },
  {
    id: "5",
    title: "Startup Hackathon Weekend",
    date: "July 5-7, 2025",
    time: "All day",
    location: "Bahir Dar, Ethiopia",
    venue: "Bahir Dar University",
    image: "/events/hackathon.jpg",
    status: "Pending Payment",
    ticketId: "SHW-25-5432",
    registrationDate: "April 1, 2025"
  }
];

// Past events
const pastEvents = [
  {
    id: "6",
    title: "AgriTech Innovation Challenge",
    date: "February 15, 2025",
    time: "10:00 AM - 3:00 PM",
    location: "Addis Ababa, Ethiopia",
    venue: "UNECA Conference Center",
    image: "/events/agritech.jpg",
    status: "Attended",
    ticketId: "AIC-25-9876",
    registrationDate: "January 10, 2025"
  },
  {
    id: "7",
    title: "East African Startup Conference",
    date: "January 25, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Addis Ababa, Ethiopia",
    venue: "Sheraton Addis",
    image: "/events/east-african.jpg",
    status: "Attended",
    ticketId: "EASC-25-6543",
    registrationDate: "December 20, 2024"
  }
];

function MyEventsPageContent() {
  const searchParams = useSearchParams();
  const registration = searchParams.get("registered");
  const registeredCode = searchParams.get("code");
  
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingTicket, setGeneratingTicket] = useState<string | null>(null);
  
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, this would come from a session/auth context
  const userEmail = "john.doe@example.com"; 

  React.useEffect(() => {
    async function fetchRegistrations() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/events/my-registrations?email=${userEmail}`);
        const data = await res.json();
        if (data.success) {
          setAllRegistrations(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch registrations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRegistrations();
  }, []);

  // Filter events based on search query and date
  const filteredUpcoming = allRegistrations.filter(
    reg => !reg.isPast && reg.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPast = allRegistrations.filter(
    reg => reg.isPast && reg.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Attended":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const downloadTicket = async (event: any) => {
    setGeneratingTicket(event.id);
    try {
      const qrData = `CERTIFICATE:${event.ticketId}|EVENT:${event.id}|DATE:${event.date}`;
      const win = window.open("", "_blank");
      if (!win) { toast.error("Please allow pop-ups"); return; }
      win.document.write(`
        <html><head><title>${event.title} - Certificate</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            width: 277mm; height: 190mm;
            display: flex; align-items: center; justify-content: center;
            background: #f8fafc;
          }
          .cert {
            width: 100%; height: 100%;
            border: 2px solid #e2e8f0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            background: #fff; padding: 30px;
            position: relative;
          }
          h1 { font-size: 28px; color: #1e293b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
          .divider { width: 80px; height: 2px; background: #4285F4; margin: 10px auto 20px; }
          .awarded { font-size: 14px; color: #64748b; font-style: italic; margin-bottom: 25px; }
          h2 { font-size: 32px; color: #4285F4; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
          p { font-size: 16px; line-height: 1.6; color: #475569; text-align: center; max-width: 600px; }
          .footer { position: absolute; bottom: 20px; left: 30px; right: 30px; display: flex; justify-content: space-between; align-items: end; }
          .footer-left { font-size: 12px; color: #94a3b8; }
          .qr-placeholder { width: 80px; height: 80px; background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; }
        </style></head><body>
        <div class="cert">
          <svg width="60" height="60" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#4285F4"/><path d="M70 30H60V50H40V60H60V80H70V60H90V50H70V30Z" fill="white"/><path d="M30 30H10V80H30V30Z" fill="white"/></svg>
          <h1>Certificate of Participation</h1>
          <div class="divider"></div>
          <p class="awarded">This certificate is awarded to</p>
          <h2>${event.attendeeName || 'Event Participant'}</h2>
          <p>For successfully participating in <strong>${event.title}</strong><br/>held on ${event.date} at ${event.venue}, ${event.location}.</p>
          <p style="margin-top:15px;font-size:14px;color:#64748b;">Certificate ID: ${event.ticketId} | Issue Date: ${new Date().toLocaleDateString()}</p>
          <div class="footer">
            <div class="footer-left">Certificate ID: ${event.ticketId}<br/>Issue Date: ${new Date().toLocaleDateString()}</div>
            <div class="qr-placeholder">QR: ${qrData.slice(0, 20)}…</div>
          </div>
        </div>
        <script>window.onload=()=>setTimeout(()=>{window.print();},300);</script>
        </body></html>`);
      win.document.close();
    } catch (err) {
      console.error('Error creating certificate:', err);
      toast.error('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingTicket(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search events..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/events">Browse Events</Link>
          </Button>
        </div>
      </div>
      
      {/* New Registration Alert */}
      {registration && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-green-800 font-medium">Registration Successful!</h3>
            <p className="text-green-700">
              You have successfully registered for an event. You can find the details below in your upcoming events.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => window.history.replaceState(null, '', '/dashboard/events/my-events')}>
            Dismiss
          </Button>
        </div>
      )}
      
      {/* Tabs */}
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events ({filteredUpcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({filteredPast.length})</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 font-medium">Retrieving your event history...</p>
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-6 mt-6">
          {filteredUpcoming.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming events found</h3>
              <p className="mt-2 text-gray-500">
                {searchQuery ? 
                  `No events match your search "${searchQuery}". Try a different search term.` : 
                  "You haven't registered for any upcoming events yet. Browse events to find something interesting."}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/events">Browse Events</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUpcoming.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <h3 className="text-lg font-semibold mt-1">{event.title}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-medium">{event.date}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="text-sm">{event.time}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-medium">{event.venue}</p>
                        </div>
                        <p className="text-sm">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Ticket ID</p>
                          <p className="text-sm font-mono font-medium">{event.ticketId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Registered on</p>
                          <p className="text-sm">{event.registrationDate}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/events/${event.id}`}>
                        View Event Details
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadTicket(event)}
                      disabled={generatingTicket === event.id}
                    >
                      {generatingTicket === event.id ? (
                        <>
                          <span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" /> Certificate
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6 mt-6">
          {filteredPast.length === 0 ? (
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No past events found</h3>
              <p className="mt-2 text-gray-500">
                {searchQuery ? 
                  `No events match your search "${searchQuery}". Try a different search term.` : 
                  "You don&apos;t have any past event registrations yet."}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/events">Browse Events</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPast.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 z-10">
                      <div className="flex items-center justify-center h-full">
                        <Badge className="bg-blue-100 text-blue-800 text-sm">Past Event</Badge>
                      </div>
                    </div>
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white z-20">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <h3 className="text-lg font-semibold mt-1">{event.title}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-medium">{event.date}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="text-sm">{event.time}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-medium">{event.venue}</p>
                        </div>
                        <p className="text-sm">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Ticket ID</p>
                          <p className="text-sm font-mono font-medium">{event.ticketId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Registered on</p>
                          <p className="text-sm">{event.registrationDate}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/events/${event.id}`}>
                        View Event Details
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadTicket(event)}
                      disabled={generatingTicket === event.id}
                    >
                      {generatingTicket === event.id ? (
                        <>
                          <span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" /> Certificate
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        </>
        )}
      </Tabs>
    </div>
  );
}

export default function MyEventsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading events...</div>}>
      <MyEventsPageContent />
    </Suspense>
  )
}
