"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";



export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;
      try {
        setIsLoading(true);
        // Fetch current event
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.success) {
          setEvent(data.data);
        }

        // Fetch all events for 'Similar Events'
        const allRes = await fetch("/api/events");
        const allData = await allRes.json();
        if (allData.success) {
          setDbEvents(allData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  const handleRegister = () => {
    setRegistering(true);
    router.push(`/dashboard/events/${eventId}/register`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-muted-foreground animate-pulse font-medium italic">Synchronizing event data...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-6 border-2 border-dashed rounded-xl">
        <div className="bg-red-50 p-4 rounded-full">
          <CalendarIcon className="h-12 w-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-muted-foreground max-w-md">
          The event you are looking for does not exist or has been removed from the ecosystem.
        </p>
        <Button onClick={() => router.push("/dashboard/events")} variant="outline" className="mt-4 border-blue-200">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2 hover:bg-blue-50">
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4 text-blue-600" />
          </Link>
        </Button>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{event.title}</h1>
      </div>
      
      {/* Event header */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 shadow-xl border border-white">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
        <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full">
          <div className="flex gap-2 mb-3">
            {(event.categories || [event.category]).map((category, i) => (
              <Badge key={i} className="bg-blue-600/30 hover:bg-blue-600/50 text-white border-blue-400/50 backdrop-blur-md px-3 py-1">
                {category}
              </Badge>
            ))}
            <Badge className="bg-white/10 text-white border-white/20 capitalize font-medium backdrop-blur-sm">
              {event.type}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight max-w-4xl">{event.title}</h1>
          <p className="text-lg text-white/90 line-clamp-2 max-w-3xl italic">{event.description}</p>
          
          <div className="flex flex-wrap mt-6 gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <CalendarIcon className="h-4 w-4 text-blue-300" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Clock className="h-4 w-4 text-blue-300" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-blue-300" />
              <span>{event.venue || event.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Users className="h-4 w-4 text-blue-300" />
              <span>{event.registeredAttendees || 0} / {event.capacity} Attendees</span>
            </div>
          </div>
        </div>
        <Image 
          src={event.image || "/events/tech-summit.jpg"} 
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <Button 
          onClick={handleRegister} 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 gap-2 h-14 px-8 text-lg font-bold shadow-lg shadow-blue-200"
          disabled={registering}
        >
          {registering ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Initiating Registration...
            </>
          ) : (
            <>Register Now<ChevronRight className="h-5 w-5" /></>
          )}
        </Button>
        <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold border-2" asChild>
          <Link href="/dashboard/events/my-events">
            My Registered Events
          </Link>
        </Button>
      </div>
      
      {/* Event details tabs */}
      <Tabs defaultValue="about" className="mt-8">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">About</TabsTrigger>
          <TabsTrigger value="faq" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-6 mt-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl">Detailed Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                {event.longDescription}
              </div>
              
              <div className="pt-8 border-t grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50/50 p-6 rounded-2xl">
                <div>
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Schedule</h3>
                  <p className="font-semibold text-gray-900">{new Date(event.date).toLocaleDateString()}, {event.time}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Venue</h3>
                  <p className="font-semibold text-gray-900">{event.venue || event.location}</p>
                  <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Pricing</h3>
                  <p className="font-semibold text-blue-600 text-lg">Free Entry</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Capacity</h3>
                  <p className="font-semibold text-gray-900">{event.capacity} total spots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Common Inquiries</CardTitle>
              <CardDescription>Everything you need to know about participating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { q: "Is registration mandatory?", a: "Yes, we have limited capacity and need to track attendance for security and logistics." },
                  { q: "Can I bring a guest?", a: "Each individual must register separately to ensure we stay within venue capacity limits." },
                  { q: "Is there childcare available?", a: "Unfortunately, we do not provide childcare for this specific event unless otherwise stated." }
                ].map((faq, i) => (
                  <div key={i} className="pb-4 border-b last:border-0 border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2 flex gap-2">
                       <span className="text-blue-500 text-lg">Q.</span> {faq.q}
                    </h3>
                    <p className="text-gray-600 pl-7 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Similar events */}
      <div className="pt-12 border-t">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Other Programs You Might Like</h2>
          <Button variant="ghost" className="text-blue-600 font-bold" asChild>
            <Link href="/dashboard/events">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbEvents
            .filter(e => e.id !== eventId)
            .slice(0, 3)
            .map((e) => (
              <Card key={e.id} className="shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group">
                <div className="relative h-32 w-full overflow-hidden">
                  <Image fill src={e.image || "/events/tech-summit.jpg"} alt={e.title} className="object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 capitalize">
                      {e.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{e.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon size={14} className="text-blue-500" />
                      <span>{new Date(e.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="line-clamp-1">{e.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href={`/dashboard/events/${e.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
