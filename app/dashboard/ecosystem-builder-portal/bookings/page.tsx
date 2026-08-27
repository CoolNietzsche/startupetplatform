import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, SearchIcon, Filter, Calendar, MoreHorizontal, Edit, Trash2, Eye, MapPin, Users, Clock } from "lucide-react";

export default function BookingsManagement() {
  // Mock data - would come from API in a real implementation
  const spaces = [
    {
      id: "1",
      name: "Innovation Lab",
      location: "Bole, Addis Ababa",
      description: "Modern workspace with high-speed internet and meeting facilities",
      capacity: 30,
      amenities: ["High-speed WiFi", "Meeting Rooms", "Coffee Station", "Projector", "Whiteboards"],
      hourlyRate: 500,
      dailyRate: 3000,
      availabilityStatus: "available",
      image: "/images/innovation-lab.jpg",
      bookingCount: 28
    },
    {
      id: "2",
      name: "Tech Conference Room",
      location: "Kazanchis, Addis Ababa",
      description: "Large conference room ideal for tech events and presentations",
      capacity: 100,
      amenities: ["AV Equipment", "Podium", "Catering Services", "High-speed WiFi", "Adjustable Lighting"],
      hourlyRate: 1200,
      dailyRate: 8000,
      availabilityStatus: "maintenance",
      image: "/images/tech-conference.jpg",
      bookingCount: 12
    },
    {
      id: "3",
      name: "Startup Huddle Room",
      location: "Mekanisa, Addis Ababa",
      description: "Cozy meeting space for small teams and brainstorming sessions",
      capacity: 10,
      amenities: ["Whiteboard Wall", "Video Conferencing", "High-speed WiFi", "Refreshments"],
      hourlyRate: 300,
      dailyRate: 2000,
      availabilityStatus: "available",
      image: "/images/huddle-room.jpg",
      bookingCount: 45
    },
    {
      id: "4",
      name: "Creative Studio",
      location: "Piassa, Addis Ababa",
      description: "Open-plan studio space for creative work and design thinking",
      capacity: 25,
      amenities: ["Design Tools", "3D Printer", "Art Supplies", "High-speed WiFi", "Sound System"],
      hourlyRate: 700,
      dailyRate: 5000,
      availabilityStatus: "booked",
      image: "/images/creative-studio.jpg",
      bookingCount: 19
    },
  ];

  const bookings = [
    {
      id: "1",
      spaceId: "1",
      startTime: "2025-08-10T09:00:00",
      endTime: "2025-08-10T17:00:00",
      bookedBy: {
        id: "user1",
        name: "Addis Tech Hub",
        email: "info@addistechhub.com",
        phone: "+251911234567"
      },
      attendees: 15,
      purpose: "Team Hackathon",
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2025-07-15T14:30:00"
    },
    {
      id: "2",
      spaceId: "3",
      startTime: "2025-08-12T13:00:00",
      endTime: "2025-08-12T15:00:00",
      bookedBy: {
        id: "user2",
        name: "GreenTech Startups",
        email: "contact@greentech.et",
        phone: "+251922345678"
      },
      attendees: 6,
      purpose: "Investor Meeting",
      status: "pending",
      paymentStatus: "awaiting",
      createdAt: "2025-07-17T09:15:00"
    },
    {
      id: "3",
      spaceId: "4",
      startTime: "2025-08-15T10:00:00",
      endTime: "2025-08-15T16:00:00",
      bookedBy: {
        id: "user3",
        name: "Digital Nomads Ethiopia",
        email: "hello@digitalnomads.et",
        phone: "+251933456789"
      },
      attendees: 20,
      purpose: "Co-working Day",
      status: "cancelled",
      paymentStatus: "refunded",
      createdAt: "2025-07-10T11:45:00"
    },
    {
      id: "4",
      spaceId: "1",
      startTime: "2025-08-18T14:00:00",
      endTime: "2025-08-18T18:00:00",
      bookedBy: {
        id: "user4",
        name: "Women in Tech Ethiopia",
        email: "info@womenintecheth.org",
        phone: "+251944567890"
      },
      attendees: 25,
      purpose: "Networking Event",
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2025-07-16T16:20:00"
    },
  ];

  // Helper functions for UI display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'booked':
        return <Badge variant="secondary">Booked</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Maintenance</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'awaiting':
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Awaiting Payment</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container px-4 py-6 lg:py-8">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Space Bookings</h1>
          <p className="text-muted-foreground">
            Manage your coworking spaces and bookings
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ecosystem-builder-portal/bookings/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Space
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="spaces" className="mt-6">
        <TabsList>
          <TabsTrigger value="spaces">Spaces</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6">
          <div className="flex flex-grow max-w-md">
            <div className="relative w-full">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="spaces" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {spaces.map((space) => (
              <Card key={space.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {space.name}
                        <span className="ml-2">{getStatusBadge(space.availabilityStatus)}</span>
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {space.location}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/ecosystem-builder-portal/bookings/spaces/${space.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/ecosystem-builder-portal/bookings/spaces/${space.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/ecosystem-builder-portal/bookings/spaces/${space.id}/calendar`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Calendar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-muted-foreground mb-4">{space.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <div className="flex items-center mt-1">
                        <Users className="mr-1 h-3 w-3" />
                        <span className="font-medium">{space.capacity} people</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium mt-1">{formatCurrency(space.hourlyRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Daily Rate</p>
                      <p className="font-medium mt-1">{formatCurrency(space.dailyRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bookings</p>
                      <p className="font-medium mt-1">{space.bookingCount}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {space.amenities.map((amenity, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-end w-full gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/ecosystem-builder-portal/bookings/spaces/${space.id}`}>
                        Manage
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/ecosystem-builder-portal/bookings/spaces/${space.id}/calendar`}>
                        View Calendar
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Space</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Date & Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Booked By</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Purpose</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Payment</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {bookings.map((booking) => {
                    const space = spaces.find(s => s.id === booking.spaceId);
                    return (
                      <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">{space?.name || "Unknown"}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span>{formatDate(booking.startTime)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div>
                            {booking.bookedBy.name}
                            <div className="text-xs text-muted-foreground">{booking.bookedBy.email}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div>
                            {booking.purpose}
                            <div className="text-xs text-muted-foreground">{booking.attendees} attendees</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{getStatusBadge(booking.status)}</td>
                        <td className="p-4 align-middle">{getStatusBadge(booking.paymentStatus)}</td>
                        <td className="p-4 align-middle text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/ecosystem-builder-portal/bookings/${booking.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {booking.status === "pending" && (
                                <>
                                  <DropdownMenuItem>
                                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircleIcon className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {booking.status === "confirmed" && (
                                <DropdownMenuItem className="text-amber-600">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Reschedule
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Contact Booker
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4 h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Calendar View</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                    A full calendar interface would be implemented here with day, week, and month views showing all bookings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Additional icon components used in the component
function CheckCircleIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
