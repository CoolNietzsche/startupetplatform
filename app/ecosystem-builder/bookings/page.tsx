"use client";

import { useState, useMemo, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  Clock,
  MapPin,
  Check,
  X,
  Eye,
  Wifi,
  Monitor,
  Coffee,
  Projector,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  location: string;
  description: string;
  amenities: string[];
  status: "available" | "occupied" | "maintenance";
  bookingsToday: number;
  image?: string;
}

interface Booking {
  id: string;
  spaceId: string;
  spaceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalCost: number;
  purpose: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

export default function EcosystemBuilderBookingsPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [spacesRes, bookingsRes] = await Promise.all([
        fetch("/api/ecosystem-builder/spaces"),
        fetch("/api/ecosystem-builder/bookings")
      ]);

      const spacesData = await spacesRes.json();
      const bookingsData = await bookingsRes.json();

      if (spacesData.success) {
        setSpaces(spacesData.data);
      }
      if (bookingsData.success) {
        setBookings(bookingsData.data);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [isEditSpaceOpen, setIsEditSpaceOpen] = useState(false);
  const [isViewSpaceOpen, setIsViewSpaceOpen] = useState(false);
  const [isViewBookingOpen, setIsViewBookingOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'space' | 'booking' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [spaceFormData, setSpaceFormData] = useState({
    name: "",
    type: "",
    capacity: "",
    pricePerHour: "",
    location: "",
    description: "",
    amenities: ""
  });

  const handleAddSpace = async () => {
    try {
      const res = await fetch("/api/ecosystem-builder/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: spaceFormData.name,
          type: spaceFormData.type,
          capacity: parseInt(spaceFormData.capacity),
          pricePerHour: parseInt(spaceFormData.pricePerHour),
          location: spaceFormData.location,
          description: spaceFormData.description,
          amenities: spaceFormData.amenities,
        })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
        setIsAddSpaceOpen(false);
        setSpaceFormData({ name: "", type: "", capacity: "", pricePerHour: "", location: "", description: "", amenities: "" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSpace = (space: Space) => {
    setSelectedSpace(space);
    setSpaceFormData({
      name: space.name,
      type: space.type,
      capacity: space.capacity.toString(),
      pricePerHour: space.pricePerHour.toString(),
      location: space.location,
      description: space.description || "",
      amenities: typeof space.amenities === "string" ? space.amenities : (space.amenities as any)?.join(', ') || ""
    });
    setIsEditSpaceOpen(true);
  };

  const handleUpdateSpace = async () => {
    if (!selectedSpace) return;
    if (!spaceFormData.name || !spaceFormData.type || !spaceFormData.capacity || !spaceFormData.pricePerHour || !spaceFormData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const res = await fetch(`/api/ecosystem-builder/spaces/${selectedSpace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: spaceFormData.name,
          type: spaceFormData.type,
          capacity: parseInt(spaceFormData.capacity),
          pricePerHour: parseInt(spaceFormData.pricePerHour),
          location: spaceFormData.location,
          description: spaceFormData.description,
          amenities: spaceFormData.amenities,
        })
      });
      if ((await res.json()).success) {
        loadData();
        setIsEditSpaceOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSpace = (id: string) => {
    setItemToDelete({ id, type: 'space' });
    setIsDeleteDialogOpen(true);
  };

  const handleViewSpace = (space: Space) => {
    setSelectedSpace(space);
    setIsViewSpaceOpen(true);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewBookingOpen(true);
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await fetch(`/api/ecosystem-builder/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBooking = (id: string) => {
    setItemToDelete({ id, type: 'booking' });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const endpoint = itemToDelete.type === 'space' 
        ? `/api/ecosystem-builder/spaces/${itemToDelete.id}` 
        : `/api/ecosystem-builder/bookings/${itemToDelete.id}`;
      
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`${itemToDelete.type === 'space' ? 'Space' : 'Booking'} deleted successfully.`);
        loadData();
      } else {
        toast.error(`Failed to delete ${itemToDelete.type}.`);
      }
    } catch (e) {
      console.error(e);
      toast.error(`An error occurred while deleting the ${itemToDelete.type}.`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const getStatusColor = (status: Space['status'] | Booking['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (lower.includes('monitor') || lower.includes('screen')) return <Monitor className="h-4 w-4" />;
    if (lower.includes('coffee')) return <Coffee className="h-4 w-4" />;
    if (lower.includes('projector')) return <Projector className="h-4 w-4" />;
    return null;
  };

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + b.totalCost, 0);

  const selectedDateKey = selectedDate ? selectedDate.toISOString().slice(0, 10) : "";

  const timelineBookings = useMemo(() => {
    const list = selectedDateKey
      ? bookings.filter((booking) => booking.date === selectedDateKey)
      : bookings;

    return [...list].sort((a, b) => {
      const aTs = new Date(`${a.date}T${a.startTime}`).getTime();
      const bTs = new Date(`${b.date}T${b.startTime}`).getTime();
      return aTs - bTs;
    });
  }, [bookings, selectedDateKey]);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Space & Booking Management</h1>
          <p className="text-muted-foreground">
            Manage spaces, reservations, and bookings for your facilities
          </p>
        </div>
        <Button onClick={() => {
          setSpaceFormData({ name: "", type: "", capacity: "", pricePerHour: "", location: "", description: "", amenities: "" });
          setIsAddSpaceOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add New Space
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spaces.length}</div>
            <p className="text-xs text-muted-foreground">
              {spaces.filter(s => s.status === "available").length} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedBookings.length} confirmed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From all bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spaces" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spaces">Spaces</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        {/* Spaces Tab */}
        <TabsContent value="spaces" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card key={space.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{space.name}</CardTitle>
                      <CardDescription>{space.type}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(space.status)}>
                      {space.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Capacity:</span>
                      </div>
                      <span className="font-medium">{space.capacity} people</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Price:</span>
                      </div>
                      <span className="font-medium">${space.pricePerHour}/hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Location:</span>
                      </div>
                      <span className="font-medium text-xs">{space.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bookings today:</span>
                      <span className="font-medium">{space.bookingsToday}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {(typeof space.amenities === 'string' ? space.amenities.split(',').map(a => a.trim()).filter(Boolean) : (space.amenities as any || [])).slice(0, 3).map((amenity: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {(typeof space.amenities === 'string' ? space.amenities.split(',').filter(Boolean) : space.amenities || []).length > 3 && (
                        <span className="text-xs text-muted-foreground">+{(space.amenities.length || 0) - 3} more</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewSpace(space)}>
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditSpace(space)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSpace(space.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                Manage and approve booking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Space</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.spaceName}</TableCell>
                      <TableCell>{booking.clientName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-muted-foreground">{booking.startTime} - {booking.endTime}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.duration}h</TableCell>
                      <TableCell className="font-medium">${booking.totalCost}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewBooking(booking)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" variant="default" onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>
                Day-by-day timeline of all space bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="calendar-date">Filter by date</Label>
                  <Input
                    id="calendar-date"
                    type="date"
                    value={selectedDateKey}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedDate(value ? new Date(`${value}T00:00:00`) : undefined);
                    }}
                    className="w-56"
                  />
                </div>
                {selectedDateKey && (
                  <Button variant="outline" onClick={() => setSelectedDate(undefined)}>
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {timelineBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings for the selected date.</p>
                ) : (
                  timelineBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => handleViewBooking(booking)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{booking.spaceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {" • "}
                            {booking.startTime} - {booking.endTime}
                          </p>
                          <p className="text-sm mt-1">{booking.clientName}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span>Cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Space Dialog */}
      <Dialog open={isAddSpaceOpen} onOpenChange={setIsAddSpaceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Space</DialogTitle>
            <DialogDescription>
              Create a new bookable space for your facility
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Space Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g., Conference Room A"
                  value={spaceFormData.name}
                  onChange={(e) => setSpaceFormData({ ...spaceFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Space Type <span className="text-red-500">*</span></Label>
                <Select value={spaceFormData.type} onValueChange={(value) => setSpaceFormData({ ...spaceFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conference Room">Conference Room</SelectItem>
                    <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                    <SelectItem value="Training Space">Training Space</SelectItem>
                    <SelectItem value="Coworking">Coworking Space</SelectItem>
                    <SelectItem value="Event Space">Event Space</SelectItem>
                    <SelectItem value="Private Office">Private Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity (people) <span className="text-red-500">*</span></Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 20"
                  value={spaceFormData.capacity}
                  onChange={(e) => setSpaceFormData({ ...spaceFormData, capacity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price per Hour ($) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 50"
                  value={spaceFormData.pricePerHour}
                  onChange={(e) => setSpaceFormData({ ...spaceFormData, pricePerHour: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Input
                id="location"
                placeholder="e.g., 2nd Floor, Building A"
                value={spaceFormData.location}
                onChange={(e) => setSpaceFormData({ ...spaceFormData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the space and its features..."
                value={spaceFormData.description}
                onChange={(e) => setSpaceFormData({ ...spaceFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                placeholder="e.g., WiFi, Projector, Whiteboard"
                value={spaceFormData.amenities}
                onChange={(e) => setSpaceFormData({ ...spaceFormData, amenities: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSpaceOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddSpace}
              disabled={!spaceFormData.name || !spaceFormData.type || !spaceFormData.capacity || !spaceFormData.pricePerHour || !spaceFormData.location}
            >
              Add Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Space Dialog */}
      <Dialog open={isEditSpaceOpen} onOpenChange={setIsEditSpaceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
            <DialogDescription>
              Update space details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Space Name</Label>
                <Input
                  id="edit-name"
                  value={spaceFormData.name}
                  onChange={(e) => setSpaceFormData({ ...spaceFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Space Type</Label>
                <Select value={spaceFormData.type} onValueChange={(value) => setSpaceFormData({ ...spaceFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conference Room">Conference Room</SelectItem>
                    <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                    <SelectItem value="Training Space">Training Space</SelectItem>
                    <SelectItem value="Coworking">Coworking Space</SelectItem>
                    <SelectItem value="Event Space">Event Space</SelectItem>
                    <SelectItem value="Private Office">Private Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Capacity (people)</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={spaceFormData.capacity}
                  onChange={(e) => setSpaceFormData({ ...spaceFormData, capacity: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price per Hour ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={spaceFormData.pricePerHour}
                  onChange={(e) => setSpaceFormData({ ...spaceFormData, pricePerHour: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={spaceFormData.location}
                onChange={(e) => setSpaceFormData({ ...spaceFormData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={spaceFormData.description}
                onChange={(e) => setSpaceFormData({ ...spaceFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amenities">Amenities (comma-separated)</Label>
              <Input
                id="edit-amenities"
                value={spaceFormData.amenities}
                onChange={(e) => setSpaceFormData({ ...spaceFormData, amenities: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSpaceOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateSpace}
              disabled={!spaceFormData.name || !spaceFormData.type || !spaceFormData.capacity || !spaceFormData.pricePerHour || !spaceFormData.location}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Space Dialog */}
      <Dialog open={isViewSpaceOpen} onOpenChange={setIsViewSpaceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSpace?.name}</DialogTitle>
            <DialogDescription>
              <Badge className={getStatusColor(selectedSpace?.status || 'available')}>
                {selectedSpace?.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedSpace && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedSpace.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Capacity</Label>
                  <p className="font-medium">{selectedSpace.capacity} people</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Price per Hour</Label>
                  <p className="font-medium">${selectedSpace.pricePerHour}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bookings Today</Label>
                  <p className="font-medium">{selectedSpace.bookingsToday}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{selectedSpace.location}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedSpace.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(typeof selectedSpace.amenities === 'string' ? selectedSpace.amenities.split(',').filter(Boolean) : selectedSpace.amenities || []).map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm">
                      {getAmenityIcon(amenity.trim())}
                      <span>{amenity.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewSpaceOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsViewSpaceOpen(false);
              if (selectedSpace) handleEditSpace(selectedSpace);
            }}>
              Edit Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={isViewBookingOpen} onOpenChange={setIsViewBookingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              <Badge className={getStatusColor(selectedBooking?.status || 'pending')}>
                {selectedBooking?.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Space Information</h3>
                <p className="text-lg font-medium">{selectedBooking.spaceName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client Name</Label>
                  <p className="font-medium">{selectedBooking.clientName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedBooking.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedBooking.clientPhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Purpose</Label>
                  <p className="font-medium">{selectedBooking.purpose}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedBooking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedBooking.duration} hours</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Cost</Label>
                  <p className="text-xl font-bold text-green-600">${selectedBooking.totalCost}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Booked On</Label>
                <p className="text-sm">{selectedBooking.createdAt}</p>
              </div>

              {selectedBooking.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      handleUpdateBookingStatus(selectedBooking.id, "confirmed");
                      setIsViewBookingOpen(false);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Booking
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => {
                      handleUpdateBookingStatus(selectedBooking.id, "cancelled");
                      setIsViewBookingOpen(false);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Booking
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewBookingOpen(false)}>Close</Button>
            {selectedBooking?.status !== "pending" && (
              <Button 
                variant="destructive"
                onClick={() => {
                  if (selectedBooking) {
                    handleDeleteBooking(selectedBooking.id);
                    setIsViewBookingOpen(false);
                  }
                }}
              >
                Delete Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
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
