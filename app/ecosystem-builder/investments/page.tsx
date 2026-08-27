"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  ChevronRight, 
  Mail, 
  ExternalLink,
  DollarSign,
  Target,
  Globe,
  Plus
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

const mockPitches: any[] = [];
const mockPortfolio: any[] = [];

export default function InvestmentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [pitches, setPitches] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    investmentThesis: "",
    minTicketSize: "",
    maxTicketSize: "",
    sectors: [],
    preferredStages: [],
    regions: [],
    portfolio: []
  });

  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
      name: "",
      stage: "Seed",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      sectors: []
  });

  const availableSectors = ["AgriTech", "FinTech", "HealthTech", "EdTech", "Logistics", "Energy", "E-commerce", "SaaS", "AI/ML", "CleanTech"];
  const availableStages = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth", "Late Stage"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [profileRes, pitchesRes] = await Promise.all([
        fetch('/api/ecosystem-builder/investments/profile'),
        fetch('/api/ecosystem-builder/investments/pitches')
      ]);

      if (profileRes.status === 403 || pitchesRes.status === 403) {
          const errorData = await profileRes.json();
          setIsCertified(false);
          setErrorMessage(errorData.error);
          return;
      }

      const profileResult = await profileRes.json();
      const pitchesResult = await pitchesRes.json();

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data);
        setFormData({
            ...profileResult.data,
            minTicketSize: profileResult.data.minTicketSize?.toString(),
            maxTicketSize: profileResult.data.maxTicketSize?.toString()
        });
        setIsCertified(true);
      }

      if (pitchesResult.success) {
        setPitches(pitchesResult.data);
      }
    } catch (error) {
      toast.error("Failed to load investment data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/ecosystem-builder/investments/profile', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        toast.success("Investment profile updated successfully");
        setIsEditingProfile(false);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while saving profile");
    }
  };

  const handleAddInvestment = () => {
      if (!investmentForm.name || !investmentForm.amount) {
          toast.error("Please fill in company name and amount");
          return;
      }

      const newInvestment = {
          ...investmentForm,
          id: Math.random().toString(36).substr(2, 9)
      };

      setFormData({
          ...formData,
          portfolio: [...(formData.portfolio || []), newInvestment]
      });

      setIsAddInvestmentOpen(false);
      setInvestmentForm({
          name: "",
          stage: "Seed",
          amount: "",
          date: new Date().toISOString().split('T')[0],
          sectors: []
      });
      toast.success("Investment added to portfolio. Remember to save changes.");
  };

  const handleRemoveInvestment = (id: string) => {
      setFormData({
          ...formData,
          portfolio: formData.portfolio.filter((p: any) => p.id !== id)
      });
      toast.success("Investment removed from portfolio.");
  };

  const toggleSector = (sector: string) => {
      if (!isEditingProfile) return;
      const currentSectors = formData.sectors || [];
      const newSectors = currentSectors.includes(sector)
          ? currentSectors.filter((s: string) => s !== sector)
          : [...currentSectors, sector];
      setFormData({ ...formData, sectors: newSectors });
  };

  const toggleStage = (stage: string) => {
      if (!isEditingProfile) return;
      const currentStages = formData.preferredStages || [];
      const newStages = currentStages.includes(stage)
          ? currentStages.filter((s: string) => s !== stage)
          : [...currentStages, stage];
      setFormData({ ...formData, preferredStages: newStages });
  };

  if (loading) return <div className="p-12 text-center">Loading investment data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Management</h1>
          <p className="text-muted-foreground">
            Manage your investment profile, pitches, and portfolio.
          </p>
        </div>
        <Button 
          disabled={!isCertified}
          onClick={() => setIsEditingProfile(!isEditingProfile)}
        >
          {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </div>

      {!isCertified && (
          <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Verification Required
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-amber-700">
                      {errorMessage || "Your account must be certified before you can manage investments or view pitches."}
                  </p>
                  <p className="text-amber-600 text-sm mt-2">
                      Please complete your ecosystem builder application and wait for approval.
                  </p>
              </CardContent>
              <CardFooter>
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100" asChild>
                      <a href="/ecosystem-builder/apply">Go to Application</a>
                  </Button>
              </CardFooter>
          </Card>
      )}

      {isCertified && (
        <Tabs defaultValue="pitches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pitches" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pitches Received
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Investment Profile
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pitches" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            {pitches.length === 0 ? (
               <Card><CardContent className="p-8 text-center text-muted-foreground">No pitches received yet.</CardContent></Card>
            ) : pitches.map((pitch) => (
              <Card key={pitch.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pitch.subject}</CardTitle>
                      <CardDescription>from {pitch.startup?.startup?.name || `${pitch.startup?.firstName} ${pitch.startup?.lastName}`}</CardDescription>
                    </div>
                    <Badge variant={pitch.status === "PENDING" ? "outline" : "secondary"}>
                      {pitch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {pitch.message}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{new Date(pitch.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{pitch.startup?.email}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end gap-2">
                  <Button variant="outline" size="sm">View Files</Button>
                  <Button size="sm">Respond</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Criteria</CardTitle>
              <CardDescription>
                Information displayed to startups looking for funding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="thesis">Investment Thesis</Label>
                  <Textarea 
                    id="thesis" 
                    disabled={!isEditingProfile}
                    value={formData.investmentThesis || ""}
                    onChange={(e) => setFormData({...formData, investmentThesis: e.target.value})}
                    placeholder="Describe your investment strategy..."
                    className="h-24"
                  />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minTicket">Min Ticket Size ($)</Label>
                      <Input 
                        id="minTicket" 
                        disabled={!isEditingProfile}
                        value={formData.minTicketSize || ""}
                        onChange={(e) => setFormData({...formData, minTicketSize: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTicket">Max Ticket Size ($)</Label>
                      <Input 
                        id="maxTicket" 
                        disabled={!isEditingProfile}
                        value={formData.maxTicketSize || ""}
                        onChange={(e) => setFormData({...formData, maxTicketSize: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Focus Sectors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableSectors.map((s: string) => (
                    <Badge 
                        key={s} 
                        variant={formData.sectors?.includes(s) ? "default" : "secondary"}
                        className={isEditingProfile ? "cursor-pointer hover:opacity-80" : ""}
                        onClick={() => toggleSector(s)}
                    >
                        {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Stages</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableStages.map((s: string) => (
                    <Badge 
                        key={s} 
                        variant={formData.preferredStages?.includes(s) ? "outline" : "secondary"}
                        className={`${formData.preferredStages?.includes(s) ? "border-blue-200 bg-blue-50 text-blue-700" : ""} ${isEditingProfile ? "cursor-pointer hover:opacity-80" : ""}`}
                        onClick={() => toggleStage(s)}
                    >
                        {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            {isEditingProfile && (
              <CardFooter className="justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            )}
          </Card>
          {!profile && !isEditingProfile && (
              <div className="bg-amber-50 p-6 rounded-lg text-amber-800 border border-amber-200">
                  <p className="font-medium">No investment profile found.</p>
                  <p className="text-sm mt-1">Startups cannot search for you until you define your investment criteria. Click "Edit Profile" to get started.</p>
              </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Portfolio</CardTitle>
                <CardDescription>Companies you have invested in.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setIsAddInvestmentOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Investment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stage</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {(formData.portfolio && formData.portfolio.length > 0) ? formData.portfolio.map((p: any) => (
                      <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{p.name}</td>
                        <td className="p-4 align-middle">{p.stage}</td>
                        <td className="p-4 align-middle">${p.amount}</td>
                        <td className="p-4 align-middle">{p.date}</td>
                         <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveInvestment(p.id)}>Remove</Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">Your portfolio is currently empty.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}

      {/* Add Investment Dialog */}
      <Dialog open={isAddInvestmentOpen} onOpenChange={setIsAddInvestmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Portfolio Company</DialogTitle>
            <DialogDescription>
              Enter the details of your investment to showcase in your portfolio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                placeholder="e.g. AgriFlow"
                value={investmentForm.name}
                onChange={(e) => setInvestmentForm({...investmentForm, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="investmentStage">Investment Stage</Label>
                <Select 
                  value={investmentForm.stage}
                  onValueChange={(val) => setInvestmentForm({...investmentForm, stage: val})}
                >
                  <SelectTrigger id="investmentStage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investmentAmount">Amount ($)</Label>
                <Input 
                  id="investmentAmount" 
                  type="number"
                  placeholder="e.g. 50000"
                  value={investmentForm.amount}
                  onChange={(e) => setInvestmentForm({...investmentForm, amount: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="investmentDate">Investment Date</Label>
              <Input 
                id="investmentDate" 
                type="date"
                value={investmentForm.date}
                onChange={(e) => setInvestmentForm({...investmentForm, date: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddInvestmentOpen(false)}>Cancel</Button>
            <Button onClick={handleAddInvestment}>Add to Portfolio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
