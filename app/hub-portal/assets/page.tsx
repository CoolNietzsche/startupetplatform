"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getHubAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  bookAsset,
  approveBooking,
  cancelBooking,
} from "./actions";
import { getHubDashboardData } from "../actions";

type AssetWithBookings = Awaited<ReturnType<typeof getHubAssets>>[number];
type StartupOption = { id: string; name: string };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "default",
  IN_USE: "secondary",
  MAINTENANCE: "outline",
};

function StatusBadge({ status }: { status: string }) {
  const variant = statusVariant[status] ?? "secondary";
  const className =
    status === "AVAILABLE"
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : status === "IN_USE"
        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
        : status === "MAINTENANCE"
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          : undefined;
  return <Badge variant={variant} className={className}>{status}</Badge>;
}

export default function AssetsPage() {
  const [hubId, setHubId] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetWithBookings[]>([]);
  const [startups, setStartups] = useState<StartupOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addStatus, setAddStatus] = useState("AVAILABLE");

  const [editTarget, setEditTarget] = useState<AssetWithBookings | null>(null);
  const [editStatus, setEditStatus] = useState("AVAILABLE");

  const [bookTarget, setBookTarget] = useState<AssetWithBookings | null>(null);
  const [bookStartupId, setBookStartupId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { hub } = await getHubDashboardData();
    if (!hub) return;
    setHubId(hub.id);
    setStartups(hub.startups as unknown as StartupOption[]);
    const data = await getHubAssets(hub.id);
    setAssets(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hubId) return;
    const form = new FormData(e.currentTarget);
    await createAsset({
      hubId,
      name: form.get("name") as string,
      type: form.get("type") as string,
      description: (form.get("description") as string) || undefined,
      quantity: form.get("quantity") ? Number(form.get("quantity")) : undefined,
      status: addStatus,
    });
    setAddOpen(false);
    setAddStatus("AVAILABLE");
    fetchData();
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTarget) return;
    const form = new FormData(e.currentTarget);
    await updateAsset(editTarget.id, {
      name: form.get("name") as string,
      type: form.get("type") as string,
      description: (form.get("description") as string) || undefined,
      quantity: form.get("quantity") ? Number(form.get("quantity")) : undefined,
      status: editStatus,
    });
    setEditTarget(null);
    fetchData();
  }

  async function handleDelete(assetId: string) {
    await deleteAsset(assetId);
    fetchData();
  }

  async function handleBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bookTarget) return;
    const form = new FormData(e.currentTarget);
    await bookAsset({
      assetId: bookTarget.id,
      startupId: bookStartupId,
      startDate: form.get("startDate") as string,
      endDate: form.get("endDate") as string,
    });
    setBookTarget(null);
    setBookStartupId("");
    fetchData();
  }

  async function handleApprove(bookingId: string) {
    await approveBooking(bookingId);
    fetchData();
  }

  async function handleCancel(bookingId: string) {
    await cancelBooking(bookingId);
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-500">Loading assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Assets</h1>
          <p className="text-slate-500 text-sm font-bold tracking-tight">Manage hub equipment and resources</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>Add Asset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" name="type" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={addStatus} onValueChange={setAddStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="IN_USE">In Use</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Asset</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-black tracking-tight text-slate-900">All Assets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">No assets found.</TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell><Badge variant="outline">{asset.type}</Badge></TableCell>
                    <TableCell>{asset.quantity}</TableCell>
                    <TableCell><StatusBadge status={asset.status} /></TableCell>
                    <TableCell>
                      {asset.bookings.length > 0 ? (
                        <div className="space-y-1">
                          {asset.bookings.map((b) => (
                            <div key={b.id} className="text-xs flex items-center gap-2">
                              <Badge
                                variant={b.status === "APPROVED" ? "default" : b.status === "CANCELLED" ? "destructive" : "secondary"}
                                className="text-[10px] px-1 py-0"
                              >
                                {b.status}
                              </Badge>
                              {b.status === "PENDING" && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleApprove(b.id)}
                                    className="text-green-600 hover:underline"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleCancel(b.id)}
                                    className="text-red-600 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog
                          open={editTarget?.id === asset.id}
                          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => { setEditTarget(asset); setEditStatus(asset.status); }}>Edit</Button>
                          </DialogTrigger>
                          {editTarget?.id === asset.id && (
                            <DialogContent key={editTarget.id}>
                              <DialogHeader>
                                <DialogTitle>Edit Asset</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Name</Label>
                                  <Input id="edit-name" name="name" defaultValue={editTarget.name} required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-type">Type</Label>
                                  <Input id="edit-type" name="type" defaultValue={editTarget.type} required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Input id="edit-description" name="description" defaultValue={editTarget.description ?? ""} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-quantity">Quantity</Label>
                                  <Input id="edit-quantity" name="quantity" type="number" defaultValue={editTarget.quantity} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select value={editStatus} onValueChange={setEditStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AVAILABLE">Available</SelectItem>
                                      <SelectItem value="IN_USE">In Use</SelectItem>
                                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button type="submit" className="w-full">Update Asset</Button>
                              </form>
                            </DialogContent>
                          )}
                        </Dialog>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(asset.id)}>Delete</Button>
                        <Dialog
                          open={bookTarget?.id === asset.id}
                          onOpenChange={(open) => { if (!open) { setBookTarget(null); setBookStartupId(""); } }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setBookTarget(asset)}>Book</Button>
                          </DialogTrigger>
                          {bookTarget?.id === asset.id && (
                            <DialogContent key={bookTarget.id}>
                              <DialogHeader>
                                <DialogTitle>Book Asset: {bookTarget.name}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleBook} className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Startup</Label>
                                  <Select value={bookStartupId} onValueChange={setBookStartupId}>
                                    <SelectTrigger><SelectValue placeholder="Select startup" /></SelectTrigger>
                                    <SelectContent>
                                      {startups.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="book-start-date">Start Date</Label>
                                  <Input id="book-start-date" name="startDate" type="date" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="book-end-date">End Date</Label>
                                  <Input id="book-end-date" name="endDate" type="date" required />
                                </div>
                                <Button type="submit" className="w-full">Submit Booking</Button>
                              </form>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
