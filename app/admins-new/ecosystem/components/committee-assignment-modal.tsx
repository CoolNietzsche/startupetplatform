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
  assignApplicationToCommittee, 
  getApplicationAssignment,
  unassignApplicationCommittee
} from "../ecosystem-actions";
import { 
  Loader2, 
  Users, 
  CheckCircle2, 
  UserCheck, 
  Search, 
  UserPlus, 
  Trash2,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommitteeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: { id: string; name: string } | null;
  onSuccess?: () => void;
}

export function CommitteeAssignmentModal({
  isOpen,
  onClose,
  application,
  onSuccess
}: CommitteeAssignmentModalProps) {
  // State for initial data
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  const [committees, setCommittees] = useState<any[]>([]);
  const [existingAssignment, setExistingAssignment] = useState<any>(null);
  
  // State for specific selection
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [chairMemberId, setChairMemberId] = useState<string>("");
  const [criteria, setCriteria] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // UI states
  const [showAddMember, setShowAddMember] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [addingMember, setAddingMember] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  // 1. Initial Data Fetching (Committees list and current assignment)
  const fetchInitialData = useCallback(async () => {
    if (!application) return;
    const currentAppId = application.id;
    setLoadingCommittees(true);
    
    try {
      const commRes = await getCommittees({ entityType: 'ecosystem', status: 'active' });
      if (commRes.success && application?.id === currentAppId) {
        setCommittees(commRes.data as any[]);
        
        // Fetch existing assignment if it exists
        const assignRes = await getApplicationAssignment(currentAppId);
        if (assignRes.success && assignRes.data && application?.id === currentAppId) {
          setExistingAssignment(assignRes.data);
          // Only auto-set committee ID if user hasn't selected another one yet
          if (!selectedCommitteeId) {
            setSelectedCommitteeId(assignRes.data.committeeId);
          }
        }
      }
    } finally {
      if (application?.id === currentAppId) {
        setLoadingCommittees(false);
      }
    }
  }, [application?.id, selectedCommitteeId]);

  // 2. Fetch specific committee details (members and criteria)
  const fetchCommitteeDetails = useCallback(async (committeeId: string, assignment?: any) => {
    if (!committeeId || !application) return;
    const currentAppId = application.id;
    setLoadingDetails(true);
    setFetchError(null);
    
    try {
      const [membersRes, criteriaRes] = await Promise.all([
        getCommitteeMembers(committeeId),
        getCommitteeCriteria(committeeId)
      ]);

      if (application?.id !== currentAppId) return;

      if (membersRes.success) {
        const fetchedMembers = membersRes.data ? (membersRes.data as any[]) : [];
        setMembers(fetchedMembers);
        
        if (assignment && assignment.committeeId === committeeId) {
          // Restore existing assignment selections
          setSelectedMemberIds(assignment.assignedMemberIds || []);
          setChairMemberId(assignment.chairMemberId || "");
        } else if (fetchedMembers.length > 0) {
          // Default selection for new assignment
          const activeIds = fetchedMembers.map(m => m.id);
          setSelectedMemberIds(activeIds);
          
          const chair = fetchedMembers.find(m => m.memberRole === 'chair');
          setChairMemberId(chair ? chair.id : activeIds[0]);
        } else {
          setSelectedMemberIds([]);
          setChairMemberId("");
        }
      } else {
        setFetchError(membersRes.message || "Failed to fetch committee members");
      }

      if (criteriaRes.success) {
        setCriteria(criteriaRes.data ? (criteriaRes.data as any[]) : []);
      }
    } catch (error: any) {
      setFetchError(error.message || "Critical error loading committee data");
    } finally {
      if (application?.id === currentAppId) {
        setLoadingDetails(false);
      }
    }
  }, [application?.id]);

  // 3. Effect to handle modal open
  useEffect(() => {
    if (isOpen && application) {
      fetchInitialData();
    } else {
      // Clear all state when modal is closed
      setExistingAssignment(null);
      setSelectedCommitteeId("");
      setMembers([]);
      setSelectedMemberIds([]);
      setChairMemberId("");
      setCriteria([]);
      setShowAddMember(false);
    }
  }, [isOpen, application?.id, fetchInitialData]);

  // 4. Effect to handle selection changes
  useEffect(() => {
    if (isOpen && selectedCommitteeId) {
      const match = existingAssignment?.committeeId === selectedCommitteeId ? existingAssignment : null;
      fetchCommitteeDetails(selectedCommitteeId, match);
    }
  }, [selectedCommitteeId, isOpen, existingAssignment, fetchCommitteeDetails]);

  const handleCommitteeChange = (id: string) => {
    if (!id) return;
    setSelectedCommitteeId(id);
    setFetchError(null);
    // Reset secondary state immediately for clear transition
    setMembers([]);
    setSelectedMemberIds([]);
    setChairMemberId("");
    setCriteria([]);
  };

  const handleAssign = async () => {
    if (!application || !selectedCommitteeId) return;
    
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
      const res = await assignApplicationToCommittee({
        applicationId: application.id,
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
    if (!application) return;
    setUnassigning(true);
    try {
      const res = await unassignApplicationCommittee(application.id);
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
    if (chairMemberId === id && selectedMemberIds.includes(id)) {
      setChairMemberId("");
    }
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <div className="p-6 pb-2 border-b bg-slate-50/50">
          <DialogHeader>
            <DialogTitle>Assign Application to Committee</DialogTitle>
            <DialogDescription>
              Assign <span className="font-semibold text-primary">{application?.name}</span> to a committee for review.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {loadingCommittees ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Loading committees...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Choose Evaluation Committee</Label>
                  <p className="text-[10px] text-muted-foreground uppercase">{committees.length} active committees available</p>
                </div>

                <div className="max-h-72 overflow-y-auto border-2 rounded-xl p-2 bg-slate-50/10 custom-scrollbar">
                  <RadioGroup value={selectedCommitteeId} onValueChange={handleCommitteeChange} className="grid grid-cols-1 gap-2">
                    {committees.length === 0 ? (
                      <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-3">
                        <Users className="h-10 w-10 opacity-20" />
                        <p>No active ecosystem committees found in the system</p>
                      </div>
                    ) : (
                      committees.map((c) => (
                        <div key={c.id}>
                          <RadioGroupItem value={c.id} id={c.id} className="sr-only" />
                          <Label
                            htmlFor={c.id}
                            className={`
                              flex items-start justify-between p-4 rounded-lg border transition-all cursor-pointer relative group
                              ${selectedCommitteeId === c.id 
                                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20 scale-[1.01]' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
                            `}
                          >
                            <div className="flex gap-3">
                              <div className={`
                                h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                                ${selectedCommitteeId === c.id ? 'border-primary bg-primary text-white' : 'border-slate-300'}
                              `}>
                                {selectedCommitteeId === c.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="flex flex-col gap-1 pr-4">
                                <span className={`font-bold text-sm leading-none ${selectedCommitteeId === c.id ? 'text-primary' : 'text-slate-800'}`}>
                                  {c.name}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                  <Badge variant="outline" className="h-4 px-1 text-[9px] bg-white">
                                    {c.entityType || 'ECOSYSTEM'}
                                  </Badge>
                                  <span>{c.members || 0} Members</span>
                                  <span>•</span>
                                  <span>{c.criteriaCount || 0} Rules</span>
                                </div>
                                {c.description && <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">{c.description}</p>}
                              </div>
                            </div>
                            {selectedCommitteeId === c.id && (
                              <div className="bg-primary text-white p-1 rounded-full animate-in zoom-in-50 duration-200">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            )}
                          </Label>
                        </div>
                      ))
                    )}
                  </RadioGroup>
                </div>
              </div>

              {selectedCommitteeId && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {fetchError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span>{fetchError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Committee Members</Label>
                      <p className="text-[9px] text-muted-foreground uppercase">
                        {members.length} records found in database
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddMember(!showAddMember)}>
                        {showAddMember ? "Cancel" : "Add Member"}
                      </Button>
                      <Badge variant="secondary" className="text-[10px]">{selectedMemberIds.length} Selected</Badge>
                    </div>
                  </div>

                  {showAddMember && (
                    <div className="p-3 border rounded-lg bg-muted/20 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search people..." className="pl-8 h-9 text-sm" value={userSearch} onChange={(e) => searchUsers(e.target.value)} />
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {searchingUsers ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" /> : 
                          eligibleUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-1.5 hover:bg-white rounded text-sm">
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

                  <div className="max-h-72 overflow-y-auto border rounded-md p-2 bg-gray-50/10 space-y-2">
                      {loadingDetails ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                          <p className="text-[10px] text-muted-foreground uppercase">Syncing members...</p>
                        </div>
                      ) : members.length > 0 ? (
                        members.map((m, idx) => {
                          const user = m.user || { firstName: "Unknown", lastName: "User" };
                          const initials = `${(user.firstName || "U")[0]}${(user.lastName || "U")[0]}`.toUpperCase();
                          
                          return (
                            <div key={m.id} className={`flex items-center justify-between p-2 rounded-lg border ${selectedMemberIds.includes(m.id) ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                              <div className="flex items-center gap-2">
                                <Checkbox checked={selectedMemberIds.includes(m.id)} onCheckedChange={() => toggleMember(m.id)} />
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-xs font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-[10px] text-muted-foreground capitalize">{m.memberRole}</div>
                                </div>
                              </div>
                              {selectedMemberIds.includes(m.id) && (
                                <Button variant={chairMemberId === m.id ? "default" : "outline"} size="sm" className="h-6 text-[9px]" onClick={() => setChairMemberId(m.id)}>
                                  {chairMemberId === m.id ? "Chair" : "Set Chair"}
                                </Button>
                              )}
                            </div>
                          );
                        })
                      ) : !fetchError && (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground italic text-xs">
                          No active members found in this committee.
                        </div>
                      )}
                  </div>

                  {criteria.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Evaluation Criteria</Label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {criteria.map(c => (
                          <div key={c.id} className="p-2 border rounded bg-muted/5 flex justify-between items-center text-[10px]">
                            <span className="font-medium underline-offset-4">{c.name}</span>
                            <Badge variant="outline" className="text-[9px]">{c.weight}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedMemberIds.length > 0 && (
                    <div className="bg-amber-50 p-2.5 rounded border border-amber-100 mt-2">
                      <p className="text-[10px] text-amber-800 leading-tight italic">
                        Confirming assignment to <strong>{committees.find(c => c.id === selectedCommitteeId)?.name}</strong> with {selectedMemberIds.length} members. 
                        Chair: {members.find(m => m.id === chairMemberId)?.user.firstName || "Not assigned"}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 py-4 border-t bg-slate-50/50">
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <div className="flex-1">
              {existingAssignment && (
                <Button variant="ghost" size="sm" onClick={handleUnassign} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8" disabled={unassigning}>
                  {unassigning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Unassign
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} size="sm" disabled={assigning || loadingDetails}>Cancel</Button>
              <Button onClick={handleAssign} size="sm" disabled={assigning || loadingDetails || !selectedCommitteeId}>
                {(assigning || loadingDetails) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loadingDetails ? "Fetching Members..." : (existingAssignment ? "Update Assignment" : "Confirm Assignment")}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
