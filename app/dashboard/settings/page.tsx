"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { updateProfileAction } from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Upload, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update, status } = useSession();
  const sUser = (session?.user as any) || {};
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      if (!initialLoaded) {
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setPhoneNumber(u.phoneNumber || '');
        setAddress(u.address || '');
        setInitialLoaded(true);
      }
      if (u.image) setProfileImage(u.image);
    }
  }, [session, initialLoaded]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProfileImage(data.url);
      const result = await updateProfileAction({ firstName, lastName, phoneNumber, address, image: data.url });
      if (result.success) {
        await update({ firstName, lastName, phoneNumber, address, image: data.url });
        const freshRes = await fetch("/api/auth/session", { cache: "no-store" });
        const freshSession = await freshRes.json();
        if (freshSession?.user?.image) {
          setProfileImage(freshSession.user.image);
        }
        toast({ title: "Profile picture updated", description: "Saved successfully" });
      } else {
        toast({ title: "Uploaded", description: "Saved to server, but profile update pending" });
      }
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfileAction({ firstName, lastName, phoneNumber, address, image: profileImage });
      if (result.success) {
        toast({ title: "Profile Updated", description: result.message });
        await update({ firstName, lastName, phoneNumber, address, image: profileImage });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!initialLoaded && status === "loading") {
    return (
    <div className="container mx-auto p-2 sm:p-6">
        <div className="mb-3 sm:mb-8">
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2 mb-6">
          <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto p-2 sm:p-6">
        <div className="mb-3 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-2 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            <Card className="md:col-span-1 md:order-last">
              <CardHeader><CardTitle>Profile Picture</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  {profileImage && <AvatarImage src={profileImage} alt="Profile picture" />}
                  <AvatarFallback className="text-2xl font-bold text-gray-500">
                    {(firstName?.charAt(0) || '') + (lastName?.charAt(0) || '') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="picture" className={`cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span>{isUploading ? "Uploading..." : "Upload new picture"}</span>
                    </div>
                  </Label>
                  <Input id="picture" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={sUser.email || ''} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button type="button" disabled={isSaving} onClick={handleProfileSave}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" type="password" />
              </div>
              <Button className="w-full">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
