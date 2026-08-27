"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Bell,
  Filter,
  ChevronRight,
  Calendar,
  Loader2,
} from "lucide-react";



export default function EventsPage() {
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          setDbEvents(data.data);
          setRecentActivities((data.data || []).slice(0, 5).map((e: any) => ({
            id: e.id,
            status: e.status || "upcoming",
            type: "event_registration",
            title: `Registered for ${e.title}`,
            description: e.description?.slice(0, 80) || "",
            date: new Date(e.startDate || e.createdAt).toLocaleDateString(),
            time: new Date(e.startDate || e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            eventId: e.id,
          })));
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);
  
  const categories = ["All", "Tech", "Networking", "Pitch", "Funding", "Innovation", "Hackathon", "Women in Tech", "Fintech", "AgriTech"];
  
  // Filter events based on search query and selected category
  const filteredEvents = dbEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (event.categories && event.categories.includes(selectedCategory));
    
    // Tab filtering
    if (activeTab === "featured") return matchesSearch && matchesCategory && event.status === "featured";
    if (activeTab === "upcoming") return matchesSearch && matchesCategory && event.status === "upcoming";
    
    return matchesSearch && matchesCategory;
  });
  
  // Get status color for the badge
  const getStatusColor = (status) => {
    switch(status) {
      case "Upcoming":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Featured":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "Open Registration":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  // Get status color for activity item
  const getActivityStatusColor = (status) => {
    switch(status) {
      case "success":
        return "bg-green-100 border-green-500 text-green-800";
      case "warning":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      default:
        return "bg-blue-100 border-blue-500 text-blue-800";
    }
  };
  
  // Get icon for activity item
  const getActivityIcon = (type) => {
    switch(type) {
      case "event_registration":
        return <CalendarIcon className="h-5 w-5" />;
      case "funding_application":
        return <Badge className="h-5 w-5" />;
      case "new_event":
        return <Calendar className="h-5 w-5" />;
      case "application_deadline":
        return <Clock className="h-5 w-5" />;
      case "event_reminder":
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Events & Programs</h1>
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
              <Link href="/dashboard/events/my-events">
                My Registered Events
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category, index) => (
              <Badge 
                key={index} 
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "cursor-pointer"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-muted-foreground animate-pulse">Loading amazing events...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full bg-gray-50 rounded-md p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
                  <p className="mt-2 text-gray-500">
                    {searchQuery || selectedCategory !== "All" ? 
                      `Try adjusting your search or filters to find events.` : 
                      "There are no events scheduled at this time."}
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-40">
                      <Image
                        src={event.image || "/events/tech-summit.jpg"}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <h3 className="text-lg font-semibold mt-1 line-clamp-1">{event.title}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <div className="flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
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
                            <p className="text-sm font-medium">{event.venue || event.location}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm">{event.registeredAttendees || 0} registered</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/events/${event.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="gap-1">
                        <Link href={`/dashboard/events/${event.id}/register`}>
                          Register <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
            )}
          </TabsContent>
          
          <TabsContent value="featured" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.filter(event => event.status === "featured").length === 0 ? (
                <div className="col-span-full bg-gray-50 rounded-md p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No featured events</h3>
                  <p className="mt-2 text-gray-500">
                    There are no featured events matching your current filters.
                  </p>
                </div>
              ) : (
                filteredEvents
                  .filter(event => event.status === "featured")
                  .map((event) => (
                    <Card key={event.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        <Image
                          src={event.image || "/events/tech-summit.jpg"}
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
                        <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <div className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
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
                              <p className="text-sm font-medium">{event.venue || event.location}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm">{event.registeredAttendees || 0} registered</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/events/${event.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1">
                          <Link href={`/dashboard/events/${event.id}/register`}>
                            Register <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.filter(event => event.status === "upcoming").length === 0 ? (
                <div className="col-span-full bg-gray-50 rounded-md p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming events</h3>
                  <p className="mt-2 text-gray-500">
                    There are no upcoming events matching your current filters.
                  </p>
                </div>
              ) : (
                filteredEvents
                  .filter(event => event.status === "upcoming")
                  .map((event) => (
                    <Card key={event.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        <Image
                          src={event.image || "/events/tech-summit.jpg"}
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
                        <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <div className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
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
                              <p className="text-sm font-medium">{event.venue || event.location}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm">{event.registeredAttendees || 0} registered</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/events/${event.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1">
                          <Link href={`/dashboard/events/${event.id}/register`}>
                            Register <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Recent Activities Sidebar */}
      <div className="w-full md:w-72 flex-shrink-0 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? recentActivities.map((activity: any) => (
                <div 
                  key={activity.id} 
                  className={`border-l-4 p-3 rounded-sm bg-opacity-60 ${getActivityStatusColor(activity.status)}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 text-gray-600">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{activity.date} at {activity.time}</span>
                        {activity.type.includes('event') ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                            <Link href={`/dashboard/events/${activity.eventId}`}>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        ) : activity.type.includes('funding') ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                            <Link href={`/dashboard/funding/${activity.fundingId}`}>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent activities</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button variant="outline" size="sm" className="w-full">
              View All Activities
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calendar</CardTitle>
            <CardDescription>Upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dbEvents
                .filter(event => ["featured", "upcoming"].includes(event.status))
                .slice(0, 3)
                .map((event) => (
                  <div key={event.id} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded bg-blue-100 flex flex-col items-center justify-center text-blue-800 border border-blue-200">
                      <span className="text-[10px] font-semibold uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm font-bold">{new Date(event.date).getDate()}</span>
                    </div>
                    <div>
                      <Link href={`/dashboard/events/${event.id}`} className="text-sm font-medium hover:text-blue-600">
                        {event.title}
                      </Link>
                      <p className="text-xs text-gray-500">{event.time} • {event.venue || event.location}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/events/my-events">
                View My Calendar
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
