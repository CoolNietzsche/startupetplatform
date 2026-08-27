"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  MapPin, 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  Video,
  TrendingUp,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  UserCheck,
  X as XIcon,
  Check,
  Download,
  Printer,
  Search as SearchIcon,
  Filter as FilterIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  registeredAt: string;
  status: "confirmed" | "pending" | "cancelled";
  checkInStatus: "checked-in" | "not-checked-in";
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "in-person" | "online" | "hybrid";
  category: string;
  capacity: number;
  registeredAttendees: number;
  status: "upcoming" | "past" | "draft" | "cancelled";
  imageUrl?: string;
  createdAt: string;
  attendees?: Attendee[];
}

export default function EcosystemBuilderEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ecosystem-builder/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isManageAttendeesOpen, setIsManageAttendeesOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState("");
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState("all");
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isAttendeeDetailOpen, setIsAttendeeDetailOpen] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "in-person" as Event['type'],
    category: "",
    capacity: ""
  });

  const handleCreateEvent = async () => {
    try {
      const res = await fetch("/api/ecosystem-builder/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event created successfully");
        loadData();
        setIsCreateDialogOpen(false);
        setFormData({ title: "", description: "", date: "", time: "", location: "", type: "in-person", category: "", capacity: "" });
      } else {
        toast.error(data.error || "Failed to create event");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      category: event.category,
      capacity: event.capacity.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`/api/ecosystem-builder/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event updated successfully");
        loadData();
        setIsEditDialogOpen(false);
        setFormData({ title: "", description: "", date: "", time: "", location: "", type: "in-person", category: "", capacity: "" });
      } else {
        toast.error(data.error || "Failed to update event");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  const handleDeleteEvent = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/ecosystem-builder/events/${itemToDelete}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event deleted successfully");
        loadData();
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete event");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handlePublishEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/ecosystem-builder/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "upcoming" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event published successfully");
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManageAttendees = (event: Event) => {
    setSelectedEvent(event);
    setIsManageAttendeesOpen(true);
  };

  const handleUpdateAttendeeStatus = async (eventId: string, attendeeId: string, newStatus: Attendee['status']) => {
    try {
      const res = await fetch(`/api/ecosystem-builder/events/${eventId}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
        // Also update local selectedEvent if open
        if (selectedEvent && selectedEvent.id === eventId) {
          const updatedAttendees = selectedEvent.attendees?.map(a => 
            a.id === attendeeId ? { ...a, status: newStatus } : a
          );
          setSelectedEvent({ ...selectedEvent, attendees: updatedAttendees });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintAttendees = (event: Event) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const attendeesHtml = event.attendees?.map(a => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px;">${a.name}</td>
        <td style="padding: 12px 8px;">${a.company || '-'}</td>
        <td style="padding: 12px 8px;">${a.email}<br><small style="color: #666;">${a.phone}</small></td>
        <td style="padding: 12px 8px;">
          <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; 
            background: ${a.status === 'confirmed' ? '#dcfce7' : a.status === 'pending' ? '#fef9c3' : '#fee2e2'};
            color: ${a.status === 'confirmed' ? '#166534' : a.status === 'pending' ? '#854d0e' : '#991b1b'};">
            ${a.status}
          </span>
        </td>
        <td style="padding: 12px 8px;">
          <div style="width: 16px; height: 16px; border: 1px solid #ccc; display: inline-block;"></div>
        </td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Guest List - ${event.title}</title>
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0 !important; }
            }
            body { font-family: 'Inter', system-ui, sans-serif; color: #333; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .event-info h1 { margin: 0; color: #1e3a8a; font-size: 24px; }
            .event-info p { margin: 5px 0 0; color: #666; font-size: 14px; }
            .stats { display: flex; gap: 20px; font-size: 12px; color: #444; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 12px; color: #666; text-transform: uppercase; padding: 10px 8px; border-bottom: 2px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="event-info">
              <h1>Attendee Check-in List</h1>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} | <strong>Venue:</strong> ${event.location}</p>
              <div class="stats">
                <span>Total Registered: ${event.attendees?.length || 0}</span>
                <span>Confirmed: ${event.attendees?.filter(a => a.status === 'confirmed').length || 0}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; color: #999;">Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Name</th>
                <th style="width: 20%;">Company</th>
                <th style="width: 25%;">Contact Info</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 15%;">Sign/Check</th>
              </tr>
            </thead>
            <tbody>
              ${attendeesHtml}
            </tbody>
          </table>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCheckInAttendee = async (eventId: string, attendeeId: string) => {
    try {
      setCheckingInId(attendeeId);
      const res = await fetch(`/api/ecosystem-builder/events/${eventId}/attendees/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkInStatus: "checked-in" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Attendee checked in successfully");
        loadData();
        // Also update local selectedEvent if open
        if (selectedEvent && selectedEvent.id === eventId) {
          const updatedAttendees = selectedEvent.attendees?.map(a => 
            a.id === attendeeId ? { ...a, checkInStatus: "checked-in" } : a
          );
          setSelectedEvent({ ...selectedEvent, attendees: updatedAttendees });
        }
        // Update selectedAttendee if open
        if (selectedAttendee && selectedAttendee.id === attendeeId) {
          setSelectedAttendee({ ...selectedAttendee, checkInStatus: "checked-in" });
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to check in attendee");
    } finally {
      setCheckingInId(null);
    }
  };

  const handleExportAttendees = (event: Event) => {
    if (!event.attendees || event.attendees.length === 0) {
      toast.error("No attendees to export");
      return;
    }

    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Company", "Registered Date", "Status", "Check-In Status"];
    const rows = event.attendees.map(attendee => [
      attendee.name,
      attendee.email,
      attendee.phone,
      attendee.company,
      new Date(attendee.registeredAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      attendee.status,
      attendee.checkInStatus === 'checked-in' ? 'Checked In' : 'Not Checked In'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Attendees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const upcomingEvents = events.filter(e => e.status === "upcoming");
  const pastEvents = events.filter(e => e.status === "past");
  const draftEvents = events.filter(e => e.status === "draft");
  const totalAttendees = events.reduce((sum, e) => sum + e.registeredAttendees, 0);

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'in-person': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Event['type']) => {
    if (type === 'online') return <Video className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
          <p className="text-muted-foreground">
            Create and manage events for the startup ecosystem
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents.length} upcoming
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Events</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting publication
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.length > 0 ? Math.round((totalAttendees / events.length) * 10) / 10 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per event
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="draft">Draft Events</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground italic">Synchronizing with database...</p>
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{event.title}</CardTitle>
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center mt-1 gap-2">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <Clock className="h-3 w-3 ml-2" />
                    {event.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    {getTypeIcon(event.type)}
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {event.registeredAttendees} / {event.capacity} registered
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {event.description}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex justify-between gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => handleViewEvent(event)}>
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => handleManageAttendees(event)}>
                    <Users className="mr-2 h-3 w-3" />
                    Manage Attendees ({event.attendees?.length || 0})
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No upcoming events
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{event.title}</CardTitle>
                    <Badge variant="outline" className="bg-gray-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    {getTypeIcon(event.type)}
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {event.registeredAttendees} attendees
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleViewEvent(event)}>
                    <Eye className="mr-2 h-3 w-3" />
                    View Details
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {pastEvents.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No past events
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="draft" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {draftEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{event.title}</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Draft
                    </Badge>
                  </div>
                  <CardDescription>
                    Created: {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm">
                    {getTypeIcon(event.type)}
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {event.description}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => handlePublishEvent(event.id)}>
                    Publish
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {draftEvents.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                No draft events
              </div>
            )}
          </div>
        </TabsContent>
        </>
      )}
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to the ecosystem calendar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g., Startup Pitch Competition"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="Describe the event..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type <span className="text-red-500">*</span></Label>
                <Select value={formData.type} onValueChange={(value: Event['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Summit">Summit</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  placeholder="e.g., Addis Ababa Innovation Hub"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity <span className="text-red-500">*</span></Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateEvent}
              disabled={!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.category || !formData.capacity}
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Event Type</Label>
                <Select value={formData.type} onValueChange={(value: Event['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Summit">Summit</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateEvent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <Badge className={selectedEvent ? getTypeColor(selectedEvent.type) : ''}>
                {selectedEvent?.type}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedEvent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm">{selectedEvent.time}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedEvent.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Capacity</Label>
                  <p className="font-medium">{selectedEvent.capacity} people</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Registered</Label>
                  <p className="font-medium">{selectedEvent.registeredAttendees} attendees</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{selectedEvent.status}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedEvent) handleEditEvent(selectedEvent);
            }}>
              Edit Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Attendees Dialog */}
      <Dialog open={isManageAttendeesOpen} onOpenChange={setIsManageAttendeesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Attendees - {selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              View and manage event registrations
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Registered</p>
                  <p className="text-3xl font-bold mt-1">{selectedEvent.attendees?.length || 0}</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirmed</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">
                    {selectedEvent.attendees?.filter(a => a.status === 'confirmed').length || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Checked In</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">
                    {selectedEvent.attendees?.filter(a => a.checkInStatus === 'checked-in').length || 0}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search name, email, company..." 
                    className="pl-9 bg-background"
                    value={attendeeSearchQuery}
                    onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Select value={attendeeStatusFilter} onValueChange={setAttendeeStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-background">
                      <div className="flex items-center gap-2">
                        <FilterIcon className="h-3.5 w-3.5" />
                        <SelectValue placeholder="Filter Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-background shrink-0"
                    onClick={() => handlePrintAttendees(selectedEvent)}
                    title="Print Guest List"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Attendees Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEvent.attendees && selectedEvent.attendees
                      .filter(a => {
                        const matchesSearch = 
                          a.name.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
                          a.email.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
                          a.company.toLowerCase().includes(attendeeSearchQuery.toLowerCase());
                        
                        const matchesStatus = 
                          attendeeStatusFilter === 'all' || 
                          (attendeeStatusFilter === 'checked-in' ? a.checkInStatus === 'checked-in' : a.status === attendeeStatusFilter);
                        
                        return matchesSearch && matchesStatus;
                      })
                      .length > 0 ? (
                      selectedEvent.attendees
                        .filter(a => {
                          const matchesSearch = 
                            a.name.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
                            a.email.toLowerCase().includes(attendeeSearchQuery.toLowerCase()) ||
                            a.company.toLowerCase().includes(attendeeSearchQuery.toLowerCase());
                          
                          const matchesStatus = 
                            attendeeStatusFilter === 'all' || 
                            (attendeeStatusFilter === 'checked-in' ? a.checkInStatus === 'checked-in' : a.status === attendeeStatusFilter);
                          
                          return matchesSearch && matchesStatus;
                        })
                        .map((attendee) => (
                          <TableRow key={attendee.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="font-semibold text-primary">{attendee.name}</div>
                              <div className="text-[10px] text-muted-foreground uppercase mt-0.5">
                                Reg: {new Date(attendee.registeredAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                {attendee.company || "Individual"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {attendee.email}
                                </div>
                                <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  {attendee.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={
                                  attendee.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                  attendee.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }
                              >
                                {attendee.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {attendee.checkInStatus === 'checked-in' ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <UserCheck className="h-3 w-3 mr-1.5" />
                                  Checked In
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
                                  onClick={() => handleCheckInAttendee(selectedEvent.id, attendee.id)}
                                  disabled={checkingInId === attendee.id}
                                >
                                  {checkingInId === attendee.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                  ) : (
                                    <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                  )}
                                  Check In
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setSelectedAttendee(attendee);
                                    setIsAttendeeDetailOpen(true);
                                  }}
                                  title="View Full Registration Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {attendee.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                      onClick={() => handleUpdateAttendeeStatus(selectedEvent.id, attendee.id, 'confirmed')}
                                      title="Confirm Registration"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleUpdateAttendeeStatus(selectedEvent.id, attendee.id, 'cancelled')}
                                      title="Cancel Registration"
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-muted-foreground font-medium">
                              {attendeeSearchQuery || attendeeStatusFilter !== 'all' 
                                ? "No attendees match your filters" 
                                : "No attendees registered yet"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-row justify-between items-center border-t pt-4">
            <Button 
              variant="outline" 
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none shadow-md"
              onClick={() => selectedEvent && handleExportAttendees(selectedEvent)}
              disabled={!selectedEvent?.attendees || selectedEvent.attendees.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" onClick={() => setIsManageAttendeesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendee Details Dialog */}
      <Dialog open={isAttendeeDetailOpen} onOpenChange={setIsAttendeeDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedAttendee?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border/50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {selectedAttendee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedAttendee.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Badge variant="outline" className="text-[10px] h-4">
                      {selectedAttendee.status}
                    </Badge>
                    <span>|</span>
                    <span>Registered: {new Date(selectedAttendee.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedAttendee.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedAttendee.phone}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Organization / Company</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedAttendee.company || "Individual"}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Check-In Status</Label>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {selectedAttendee.checkInStatus === 'checked-in' ? (
                        <><CheckCircle2 className="h-4 w-4 text-green-600" /> Checked In</>
                      ) : (
                        <><Clock className="h-4 w-4 text-amber-600" /> Not Checked In</>
                      )}
                    </div>
                    {selectedAttendee.checkInStatus !== 'checked-in' && (
                      <Button 
                        size="sm" 
                        onClick={() => selectedEvent && handleCheckInAttendee(selectedEvent.id, selectedAttendee.id)}
                        disabled={checkingInId === selectedAttendee.id}
                      >
                        {checkingInId === selectedAttendee.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Check In Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button variant="outline" className="w-full" onClick={() => setIsAttendeeDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
