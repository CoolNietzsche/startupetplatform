"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  getCommittees, 
  getCommitteeMembers, 
  getEligibleCommitteeUsers, 
  addCommitteeMember,
  getCommitteeCriteria 
} from "../../committees/committee-actions";
import { 
  assignApplicationToCommitteeAction, 
  getApplicationAssignment,
  unassignApplicationCommitteeAction,
  getAdminApplicationById,
} from "../application-actions";
import { 
  Loader2, 
  Users, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  UserPlus, 
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignCommitteeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  onSuccess?: () => void;
}

export function AssignCommitteeModal({
  isOpen,
  onOpenChange,
  applicationId,
  onSuccess
}: AssignCommitteeModalProps) {
  // Use a local onClose for convenience
  const onClose = () => onOpenChange(false);

  // State
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  const [committees, setCommittees] = useState<any[]>([]);
  const [existingAssignment, setExistingAssignment] = useState<any>(null);
  const [applicationStage, setApplicationStage] = useState<string>("");

  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [chairMemberId, setChairMemberId] = useState<string>("");
  const [criteria, setCriteria] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [addingMember, setAddingMember] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!applicationId) return;
    setLoadingCommittees(true);
    
    try {
      const [commRes, appRes] = await Promise.all([
        getCommittees({ entityType: 'startup', status: 'active' }),
        getAdminApplicationById(applicationId),
      ]);
      if (commRes.success) {
        setCommittees(commRes.data as any[]);
        
        const assignRes = await getApplicationAssignment(applicationId);
        if (assignRes.success && assignRes.data) {
          setExistingAssignment(assignRes.data);
          if (!selectedCommitteeId) {
            setSelectedCommitteeId(assignRes.data.committeeId);
          }
        }
      }
      if (appRes.success && appRes.data) {
        setApplicationStage((appRes.data as any).directiveStage || "");
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoadingCommittees(false);
    }
  }, [applicationId, selectedCommitteeId]);

  // Fetch committee details
  const fetchCommitteeDetails = useCallback(async (committeeId: string, assignment?: any) => {
    if (!committeeId || !applicationId) return;
    setLoadingDetails(true);
    setFetchError(null);
    
    try {
      const [membersRes, criteriaRes] = await Promise.all([
        getCommitteeMembers(committeeId),
        getCommitteeCriteria(committeeId)
      ]);

      if (membersRes.success) {
        const fetchedMembers = membersRes.data ? (membersRes.data as any[]) : [];
        setMembers(fetchedMembers);
        
        if (assignment && assignment.committeeId === committeeId) {
          // Find member records that match the existing reviews/chair
          const currentMemberIds = fetchedMembers
            .filter(m => assignment.reviews.some((r: any) => r.memberId === m.userId))
            .map(m => m.id);
          
          setSelectedMemberIds(currentMemberIds);
          
          const chair = fetchedMembers.find(m => m.id === assignment.chairMemberId);
          setChairMemberId(chair ? chair.id : "");
        } else if (fetchedMembers.length > 0) {
          const activeIds = fetchedMembers.map(m => m.id);
          setSelectedMemberIds(activeIds);
          const chair = fetchedMembers.find(m => m.memberRole === 'chair');
          setChairMemberId(chair ? chair.id : activeIds[0]);
        } else {
          setSelectedMemberIds([]);
          setChairMemberId("");
        }
      } else {
        setFetchError(membersRes.message || "Failed to fetch members");
      }

      if (criteriaRes.success) {
        setCriteria(criteriaRes.data ? (criteriaRes.data as any[]) : []);
      }
    } catch (error: any) {
      setFetchError(error.message || "Error loading committee data");
    } finally {
      setLoadingDetails(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchInitialData();
    } else if (!isOpen) {
      // Reset state
      setExistingAssignment(null);
      setSelectedCommitteeId("");
      setMembers([]);
      setSelectedMemberIds([]);
      setChairMemberId("");
      setCriteria([]);
      setShowAddMember(false);
    }
  }, [isOpen, applicationId, fetchInitialData]);

  useEffect(() => {
    if (isOpen && selectedCommitteeId) {
      const match = existingAssignment?.committeeId === selectedCommitteeId ? existingAssignment : null;
      fetchCommitteeDetails(selectedCommitteeId, match);
    }
  }, [selectedCommitteeId, isOpen, existingAssignment, fetchCommitteeDetails]);

  const handleCommitteeChange = (id: string) => {
    setSelectedCommitteeId(id);
    setFetchError(null);
    setMembers([]);
    setSelectedMemberIds([]);
    setChairMemberId("");
    setCriteria([]);
  };

  const handleAssign = async () => {
    if (!applicationId || !selectedCommitteeId) return;
    
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one committee member.");
      return;
    }
    if (!chairMemberId) {
      toast.error("Please designate a Committee Chairperson.");
      return;
    }

    setAssigning(true);
    try {
      const res = await assignApplicationToCommitteeAction({
        applicationId,
        committeeId: selectedCommitteeId,
        memberIds: selectedMemberIds,
        chairMemberId: chairMemberId
      });

      if (res.success) {
        toast.success("Assignment successful");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Assignment failed");
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    setUnassigning(true);
    try {
      const res = await unassignApplicationCommitteeAction(applicationId);
      if (res.success) {
        toast.success("Unassigned successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Unassignment failed");
      }
    } finally {
      setUnassigning(false);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const searchUsers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) {
      setEligibleUsers([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const res = await getEligibleCommitteeUsers({ search: query, committeeId: selectedCommitteeId });
      if (res.success) setEligibleUsers(res.data as any[]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedCommitteeId) return;
    setAddingMember(userId);
    try {
      const res = await addCommitteeMember({ committeeId: selectedCommitteeId, userId, memberRole: 'member' });
      if (res.success) {
        toast.success("Member added");
        fetchCommitteeDetails(selectedCommitteeId, existingAssignment);
        setUserSearch("");
        setEligibleUsers([]);
        setShowAddMember(false);
      } else {
        toast.error(res.message || "Failed to add member");
      }
    } finally {
      setAddingMember(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <div className="p-6 pb-2 border-b bg-slate-50/50">
          <DialogHeader>
            <DialogTitle>Assign Application to Committee</DialogTitle>
            <DialogDescription>
              Select a committee and members to review this startup application.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingCommittees ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Loading committees...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {applicationStage && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider">Startup Stage:</span>
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5">
                      {applicationStage === "INITIAL" ? "Initial" : applicationStage === "POST_INITIAL" ? "Post-Initial" : "Scale & Exit"}
                    </Badge>
                    <span className="text-[10px] text-indigo-400 ml-auto">
                      Committee should match this stage
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Choose Evaluation Committee</Label>
                  <p className="text-[10px] text-muted-foreground uppercase">{committees.length} active committees</p>
                </div>

                <div className="max-h-60 overflow-y-auto border-2 rounded-xl p-2 bg-slate-50/10">
                  <RadioGroup value={selectedCommitteeId} onValueChange={handleCommitteeChange} className="grid grid-cols-1 gap-2">
                    {committees.length === 0 ? (
                      <div className="py-10 text-center text-xs text-muted-foreground italic">
                        No active startup committees found.
                      </div>
                    ) : (
                      committees.map((c) => {
                        const presetStage = (c as any).directivePreset?.replace("STARTUP_", "") || "";
                        const matchesStage = applicationStage && presetStage === applicationStage;
                        return (
                          <div key={c.id}>
                            <RadioGroupItem value={c.id} id={c.id} className="sr-only" />
                            <Label
                              htmlFor={c.id}
                              className={`
                                flex items-start justify-between p-4 rounded-lg border transition-all cursor-pointer relative
                                ${selectedCommitteeId === c.id 
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/20' 
                                  : matchesStage
                                  ? 'border-emerald-300 bg-emerald-50/30'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
                              `}
                            >
                              <div className="flex gap-3">
                                <div className={`
                                  h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                                  ${selectedCommitteeId === c.id ? 'border-indigo-600 bg-indigo-600 text-white' : matchesStage ? 'border-emerald-400' : 'border-slate-300'}
                                `}>
                                  {selectedCommitteeId === c.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className={`font-bold text-sm ${selectedCommitteeId === c.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                                    {c.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <Badge variant="outline" className="h-4 px-1 text-[9px] bg-white text-indigo-700">
                                      STARTUP
                                    </Badge>
                                    <span>{c.members || 0} Members</span>
                                    <span>•</span>
                                    <span>{c.criteriaCount || 0} Criteria</span>
                                    {matchesStage && (
                                      <Badge className="h-4 px-1 text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200 font-bold">
                                        MATCHES STAGE
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {selectedCommitteeId === c.id && (
                                <CheckCircle2 className="h-5 w-5 text-indigo-600 animate-in zoom-in-50" />
                              )}
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </RadioGroup>
                </div>
              </div>

              {selectedCommitteeId && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  {fetchError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                      {fetchError}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Committee Members</Label>
                      <p className="text-[9px] text-muted-foreground uppercase">Assign specific reviewers</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddMember(!showAddMember)}>
                        {showAddMember ? "Cancel" : "Add Member"}
                      </Button>
                      <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700">{selectedMemberIds.length} Selected</Badge>
                    </div>
                  </div>

                  {showAddMember && (
                    <div className="p-3 border rounded-lg bg-slate-50 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search people..." className="pl-8 h-9 text-sm" value={userSearch} onChange={(e) => searchUsers(e.target.value)} />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {searchingUsers ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" /> : 
                          eligibleUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-1.5 hover:bg-white rounded text-sm bg-white/50 border border-transparent hover:border-slate-200">
                              <span>{u.firstName} {u.lastName}</span>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleAddMember(u.id)} disabled={addingMember === u.id}>
                                {addingMember === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto border rounded-xl p-2 bg-slate-50 shadow-inner space-y-2">
                      {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Syncing team...</p>
                        </div>
                      ) : members.length > 0 ? (
                        members.map((m) => {
                          const user = m.user || { firstName: "Unknown", lastName: "User" };
                          const initials = `${(user.firstName || "U")[0]}${(user.lastName || "U")[0]}`.toUpperCase();
                          const isSelected = selectedMemberIds.includes(m.id);
                          
                          return (
                            <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-white border-indigo-200 shadow-sm' : 'bg-transparent border-transparent opacity-60'}`}>
                              <div className="flex items-center gap-3">
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleMember(m.id)} className="data-[state=checked]:bg-indigo-600 border-slate-300" />
                                <Avatar className="h-8 w-8 border border-white shadow-sm">
                                  <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-700">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                                  <div className="text-[10px] text-indigo-600 font-medium uppercase tracking-tighter">{m.memberRole}</div>
                                </div>
                              </div>
                              {isSelected && (
                                <Button 
                                  variant={chairMemberId === m.id ? "default" : "outline"} 
                                  size="sm" 
                                  className={`h-7 text-[9px] font-bold px-3 transition-colors ${chairMemberId === m.id ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`} 
                                  onClick={() => setChairMemberId(m.id)}
                                >
                                  {chairMemberId === m.id ? "Chairman" : "Set Chair"}
                                </Button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground italic text-xs gap-3">
                          <Users className="h-8 w-8 opacity-20" />
                          <p>No members in this committee yet.</p>
                        </div>
                      )}
                  </div>

                  {criteria.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Evaluation Rules</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {criteria.map(c => (
                          <div key={c.id} className="px-2 py-1.5 border rounded-lg bg-white flex justify-between items-center text-[10px] shadow-sm">
                            <span className="font-semibold text-slate-700 truncate mr-2">{c.name}</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-50">{c.weight}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 py-4 border-t bg-slate-50/50">
          <DialogFooter className="flex justify-between items-center w-full">
            <div className="flex-1">
              {existingAssignment && (
                <Button variant="ghost" size="sm" onClick={handleUnassign} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 font-bold" disabled={unassigning}>
                  {unassigning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Release Committee
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} size="sm" className="h-9 px-4 rounded-xl" disabled={assigning || loadingDetails}>Cancel</Button>
              <Button onClick={handleAssign} size="sm" className="h-9 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md font-bold" disabled={assigning || loadingDetails || !selectedCommitteeId}>
                {(assigning || loadingDetails) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loadingDetails ? "Syncing..." : (existingAssignment ? "Update Team" : "Confirm Assignment")}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
