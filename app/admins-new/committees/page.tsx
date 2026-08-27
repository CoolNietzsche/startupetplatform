"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  MoreHorizontal, 
  Users, 
  UserPlus,
  CheckCircle2,
  UserCheck,
  Loader2,
  X
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from 'next/link';
import { toast } from "sonner";

import {
  addCommitteeMember,
  createCommittee,
  deleteCommittee,
  deleteCommitteeCriterion,
  getAvailablePresets,
  getCommitteeCriteria,
  getCommitteeMembers,
  getCommittees,
  getEligibleCommitteeUsers,
  loadDirectivePreset,
  removeCommitteeMember,
  updateCommittee,
  updateCommitteeMemberRole,
  upsertCommitteeCriterion,
} from "./committee-actions";

type EntityType = "startup" | "ecosystem";
type StatusType = "active" | "inactive";

type CommitteeRow = {
  id: string;
  name: string;
  description: string;
  entityType: EntityType;
  members: number;
  requiredApprovals: number;
  passThreshold: number | null;
  directivePreset: string | null;
  status: StatusType;
  createdAt: string;
};

type CriterionRow = {
  id: string;
  committeeId: string;
  name: string;
  description: string;
  weight: number;
  directivePreset: string | null;
  directiveRef: string | null;
};

type CommitteeMemberRow = {
  id: string;
  committeeId: string;
  userId: string;
  memberRole: "chair" | "member";
  addedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

const MAX_COMMITTEE_NAME_LENGTH = 120;

const MAX_COMMITTEE_DESCRIPTION_LENGTH = 500;

export default function CommitteesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [committees, setCommittees] = useState<CommitteeRow[]>([]);
  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const [savingCommittee, setSavingCommittee] = useState(false);
  
  const [showCommitteeDialog, setShowCommitteeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showCriteriaDialog, setShowCriteriaDialog] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentCommittee, setCurrentCommittee] = useState({
    id: '',
    name: '',
    description: '',
    entityType: 'startup',
    members: 0,
    requiredApprovals: 0,
    status: 'active'
  });
  const [deleteId, setDeleteId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Current criteria being edited
  const [currentCriteria, setCurrentCriteria] = useState({
    id: '',
    name: '',
    description: '',
    weight: 20
  });
  const [criteriaFormOpen, setCriteriaFormOpen] = useState(false);
  const [criteriaList, setCriteriaList] = useState<CriterionRow[]>([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [criteriaSaving, setCriteriaSaving] = useState(false);

  const [presetOptions, setPresetOptions] = useState<any[]>([]);
  const [presetLoading, setPresetLoading] = useState(false);
  const [members, setMembers] = useState<CommitteeMemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [eligibleSearch, setEligibleSearch] = useState('');
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null);
  const [memberManagementError, setMemberManagementError] = useState<string | null>(null);

  const [createMemberSearch, setCreateMemberSearch] = useState('');
  const [createMemberResults, setCreateMemberResults] = useState<any[]>([]);
  const [createMemberLoading, setCreateMemberLoading] = useState(false);
  const [createSelectedMembers, setCreateSelectedMembers] = useState<any[]>([]);
  const [createChairMember, setCreateChairMember] = useState<any | null>(null);
  const [createPickerOpen, setCreatePickerOpen] = useState(false);
  const [requiredApprovalsInput, setRequiredApprovalsInput] = useState("0");
  const [committeeFormErrors, setCommitteeFormErrors] = useState<{
    name?: string;
    description?: string;
    members?: string;
    requiredApprovals?: string;
    chairman?: string;
  }>({});

  const fetchCreateMembers = async (query: string) => {
    setCreateMemberLoading(true);
    try {
      const r = await getEligibleCommitteeUsers({ search: query, onlyCommitteeRole: true });
      if (!r.success) {
        toast.error(r.message || "Failed to load users");
        setCreateMemberResults([]);
        return;
      }
      setCreateMemberResults(r.data as any);
    } finally {
      setCreateMemberLoading(false);
    }
  };

  const fetchEligibleUsers = async (query: string) => {
    if (!showMembersDialog) return;
    if (!currentCommittee.id) return;
    setEligibleLoading(true);
    try {
      const res = await getEligibleCommitteeUsers({
        search: query,
        committeeId: currentCommittee.id,
      });
      if (!res.success) {
        toast.error(res.message || "Failed to load users");
        setEligibleUsers([]);
        return;
      }
      setEligibleUsers(res.data as any);
    } finally {
      setEligibleLoading(false);
    }
  };

  const allCreateResultsSelected =
    createMemberResults.length > 0 &&
    createMemberResults.every((user) =>
      createSelectedMembers.some((selectedUser) => selectedUser.id === user.id),
    );

  const toggleCreateMemberSelection = (user: any) => {
    setCreateSelectedMembers((prev) => {
      const isSelected = prev.some((selectedUser) => selectedUser.id === user.id);

      if (isSelected) {
        if (createChairMember?.id === user.id) {
          setCreateChairMember(null);
          setCommitteeFormErrors((current) => ({ ...current, chairman: undefined }));
        }

        return prev.filter((selectedUser) => selectedUser.id !== user.id);
      }

      return [...prev, user];
    });

    setCommitteeFormErrors((prev) => ({ ...prev, members: undefined }));
  };

  const handleSelectAllCreateMembers = () => {
    setCreateSelectedMembers((prev) => {
      const remainingUsers = createMemberResults.filter(
        (user) => !prev.some((selectedUser) => selectedUser.id === user.id),
      );

      return [...prev, ...remainingUsers];
    });
  };

  const handleClearCreateMembers = () => {
    if (createChairMember && createMemberResults.some((user) => user.id === createChairMember.id)) {
      setCreateChairMember(null);
    }

    setCreateSelectedMembers((prev) =>
      prev.filter(
        (selectedUser) =>
          !createMemberResults.some((user) => user.id === selectedUser.id),
      ),
    );
  };

  const fetchCommittees = async () => {
    setLoadingCommittees(true);
    try {
      const res = await getCommittees({
        search: searchQuery,
        entityType: typeFilter as any,
        status: statusFilter as any,
      });
      if (!res.success) {
        toast.error(res.message || "Failed to load committees");
        setCommittees([]);
        return;
      }
      setCommittees(res.data as any);
    } finally {
      setLoadingCommittees(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    if (!showCommitteeDialog) return;
    if (isEditing) return;
    fetchCreateMembers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCommitteeDialog, isEditing]);

  const filteredCommittees = useMemo(() => committees, [committees]);
  const activeChairMemberId = useMemo(
    () => members.find((member) => member.memberRole === 'chair')?.id ?? null,
    [members],
  );
  const requiredApprovalsMax = createSelectedMembers.length;
  
  // Handle adding a new committee
  const handleAddCommittee = () => {
    setIsEditing(false);
    setCurrentCommittee({
      id: '',
      name: '',
      description: '',
      entityType: 'startup',
      members: 0,
      requiredApprovals: 0,
      status: 'active'
    });
    setRequiredApprovalsInput('0');
    setCreateMemberSearch('');
    setCreateMemberResults([]);
    setCreateSelectedMembers([]);
    setCreateChairMember(null);
    setCommitteeFormErrors({});
    setShowCommitteeDialog(true);
  };
  
  // Handle editing a committee
  const handleEditCommittee = async (committee: CommitteeRow) => {
    setIsEditing(true);
    setCurrentCommittee({
      id: committee.id,
      name: committee.name,
      description: committee.description,
      entityType: committee.entityType,
      members: committee.members,
      requiredApprovals: committee.requiredApprovals,
      status: committee.status
    });
    setRequiredApprovalsInput(`${committee.requiredApprovals}`);
    setCommitteeFormErrors({});
    
    // Fetch and populate existing members
    setCreateSelectedMembers([]);
    setCreateChairMember(null);
    setCreateMemberLoading(true);
    
    try {
      const res = await getCommitteeMembers(committee.id);
      if (res.success && res.data) {
        const existingMembers = res.data.map((m: any) => ({
          id: m.userId,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          email: m.user.email,
          phoneNumber: m.user.phoneNumber || ""
        }));
        setCreateSelectedMembers(existingMembers);
        
        const chair = res.data.find((m: any) => m.memberRole === 'chair');
        if (chair) {
          setCreateChairMember({
            id: chair.userId,
            firstName: chair.user.firstName,
            lastName: chair.user.lastName,
            email: chair.user.email
          });
        }
      }
    } catch (error) {
      console.error("Failed to load committee members for editing:", error);
      toast.error("Failed to load committee members");
    } finally {
      setCreateMemberLoading(false);
    }
    
    setShowCommitteeDialog(true);
  };
  
  // Handle saving committee changes
  const handleSaveCommittee = async () => {
    setSavingCommittee(true);
    try {
      const normalizedName = currentCommittee.name.trim().replace(/\s+/g, ' ');
      const normalizedDescription = currentCommittee.description.trim().replace(/\s+/g, ' ');
      const requiredApprovals = Number(requiredApprovalsInput || 0);
      const maxRequiredApprovals = isEditing
        ? currentCommittee.members
        : createSelectedMembers.length;
      const nextErrors: {
        name?: string;
        description?: string;
        members?: string;
        requiredApprovals?: string;
        chairman?: string;
      } = {};

      if (!normalizedName) {
        nextErrors.name = "Committee name is required";
      } else if (normalizedName.length < 3) {
        nextErrors.name = "Committee name must be at least 3 characters";
      } else if (normalizedName.length > MAX_COMMITTEE_NAME_LENGTH) {
        nextErrors.name = `Committee name must be ${MAX_COMMITTEE_NAME_LENGTH} characters or less`;
      }

      if (normalizedDescription.length > MAX_COMMITTEE_DESCRIPTION_LENGTH) {
        nextErrors.description = `Committee description must be ${MAX_COMMITTEE_DESCRIPTION_LENGTH} characters or less`;
      }

      if (!Number.isInteger(requiredApprovals)) {
        nextErrors.requiredApprovals = "Required approvals must be a whole number";
      } else if (requiredApprovals < 0 || requiredApprovals > maxRequiredApprovals) {
        nextErrors.requiredApprovals = `Required approvals must be between 0 and ${maxRequiredApprovals}`;
      }

      if (createSelectedMembers.length === 0) {
        nextErrors.members = "Assign at least one member, including the chairman";
      }

      if (!createChairMember) {
        nextErrors.chairman = "Exactly one chair is required";
      } else if (createChairMember) {
        const chairmanSelected = createSelectedMembers.some(
          (member) => member.id === createChairMember.id,
        );

        if (!chairmanSelected) {
          nextErrors.chairman = "The chairman must be included in the assigned members";
        }
      }

      if (Object.keys(nextErrors).length > 0) {
        setCommitteeFormErrors(nextErrors);
        if (nextErrors.name) {
          toast.error(nextErrors.name);
        } else if (nextErrors.description) {
          toast.error(nextErrors.description);
        } else if (nextErrors.members) {
          toast.error(nextErrors.members);
        } else if (nextErrors.requiredApprovals) {
          toast.error(nextErrors.requiredApprovals);
        } else if (nextErrors.chairman) {
          toast.error(nextErrors.chairman);
        }
        return;
      }

      setCommitteeFormErrors({});

      if (isEditing && currentCommittee.id) {
        const res = await updateCommittee(currentCommittee.id, {
          name: normalizedName,
          description: normalizedDescription,
          entityType: currentCommittee.entityType as any,
          requiredApprovals: requiredApprovals || 0,
          status: currentCommittee.status as any,
          members: createSelectedMembers.map((member) => ({
            userId: member.id,
            memberRole: createChairMember?.id === member.id ? 'chair' : 'member',
          })),
        });
        if (!res.success) {
          toast.error(res.message || "Failed to update committee");
          return;
        }
        toast.success("Committee updated");
      } else {
        const res = await createCommittee({
          name: normalizedName,
          description: normalizedDescription,
          entityType: currentCommittee.entityType as any,
          requiredApprovals,
          status: currentCommittee.status as any,
          initialMembers: createSelectedMembers.map((member) => ({
            userId: member.id,
            memberRole: createChairMember?.id === member.id ? 'chair' : 'member',
          })),
        });
        if (!res.success) {
          toast.error(res.message || "Failed to create committee");
          return;
        }

        toast.success("Committee created");
      }

      setShowCommitteeDialog(false);
      await fetchCommittees();
    } finally {
      setSavingCommittee(false);
    }
  };
  
  // Handle deleting a committee
  const handleDeleteCommittee = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };
  
  // Confirm committee deletion
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await deleteCommittee(deleteId);
      if (!res.success) {
        toast.error(res.message || "Failed to delete committee");
        return;
      }
      toast.success("Committee deleted");
      setShowDeleteDialog(false);
      await fetchCommittees();
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Open committee members dialog
  const handleManageMembers = async (committee: CommitteeRow) => {
    setCurrentCommittee(committee);
    setShowMembersDialog(true);
    setMembers([]);
    setEligibleUsers([]);
    setEligibleSearch('');
    setMemberManagementError(null);

    setMembersLoading(true);
    try {
      const res = await getCommitteeMembers(committee.id);
      if (!res.success) {
        toast.error(res.message || "Failed to load members");
        return;
      }
      setMembers(res.data as any);
    } finally {
      setMembersLoading(false);
    }
  };
  
  // Open criteria management dialog
  const handleManageCriteria = async (committee: CommitteeRow) => {
    setCurrentCommittee(committee);
    setCurrentCriteria({ id: '', name: '', description: '', weight: 20 });
    setCriteriaFormOpen(false);
    setShowCriteriaDialog(true);

    setCriteriaLoading(true);
    setPresetLoading(true);
    try {
      const [criteriaRes, presetsRes] = await Promise.all([
        getCommitteeCriteria(committee.id),
        getAvailablePresets(committee.entityType),
      ]);
      if (!criteriaRes.success) {
        toast.error(criteriaRes.message || "Failed to load criteria");
        setCriteriaList([]);
        return;
      }
      setCriteriaList(criteriaRes.data as any);
      if (presetsRes.success) {
        setPresetOptions(presetsRes.data as any);
      }
    } finally {
      setCriteriaLoading(false);
      setPresetLoading(false);
    }
  };
  
  // Add new criteria
  const handleAddCriteria = () => {
    setCurrentCriteria({
      id: '',
      name: '',
      description: '',
      weight: 20
    });
    setCriteriaFormOpen(true);
  };
  
  // Edit criteria
  const handleEditCriteria = (criteria: CriterionRow) => {
    setCurrentCriteria(criteria);
    setCriteriaFormOpen(true);
  };
  
  // Save criteria
  const handleSaveCriteria = async () => {
    if (!currentCommittee.id) return;
    if (!currentCriteria.name.trim()) {
      toast.error("Criterion name is required");
      return;
    }
    if (!currentCriteria.weight || Number(currentCriteria.weight) < 1 || Number(currentCriteria.weight) > 100) {
      toast.error("Weight must be between 1 and 100");
      return;
    }
    setCriteriaSaving(true);
    try {
      const res = await upsertCommitteeCriterion({
        id: currentCriteria.id || undefined,
        committeeId: currentCommittee.id,
        name: currentCriteria.name,
        description: currentCriteria.description,
        weight: Number(currentCriteria.weight) || 0,
      });
      if (!res.success) {
        toast.error(res.message || "Failed to save criterion");
        return;
      }

      if (res.data) {
        setCriteriaList((prev) => {
          const existingIndex = prev.findIndex((criterion) => criterion.id === res.data.id);

          if (existingIndex >= 0) {
            return prev.map((criterion) =>
              criterion.id === res.data.id ? (res.data as CriterionRow) : criterion,
            );
          }

          return [...prev, res.data as CriterionRow];
        });
      }

      toast.success("Criterion saved");
      setCurrentCriteria({ id: '', name: '', description: '', weight: 20 });
      setCriteriaFormOpen(false);

      const refresh = await getCommitteeCriteria(currentCommittee.id);
      if (refresh.success) setCriteriaList(refresh.data as any);
    } finally {
      setCriteriaSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="container py-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Committee Management</h1>
          <p className="text-muted-foreground">Manage assessment committees and their members</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/committee-portal/dashboard">
              <UserCheck className="mr-2 h-4 w-4" />
              Committee Portal
            </Link>
          </Button>
          <Button onClick={handleAddCommittee}>
            <Plus className="mr-2 h-4 w-4" />
            Create Committee
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Total Committees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{committees.length}</div>
            <p className="text-xs text-muted-foreground">
              {committees.filter(committee => committee.status === 'active').length} active committees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Startup Committees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {committees.filter(committee => committee.entityType === 'startup').length}
            </div>
            <p className="text-xs text-muted-foreground">
              For startup assessment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-sm font-medium">Ecosystem Committees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {committees.filter(committee => committee.entityType === 'ecosystem').length}
            </div>
            <p className="text-xs text-muted-foreground">
              For ecosystem builder assessment
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search committees..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-1 items-center gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="ecosystem">Ecosystem Builder</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Committees table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Committee</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Required Approvals</TableHead>
                  <TableHead>Pass Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCommittees ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading committees...
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {!loadingCommittees
                ? filteredCommittees.map((committee) => (
                    <TableRow key={committee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{committee.name}</div>
                          <div className="text-xs text-muted-foreground">{committee.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {committee.entityType === 'startup' ? 'Startup' : 'Ecosystem Builder'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          {committee.members}
                        </div>
                      </TableCell>
                      <TableCell>{committee.requiredApprovals}</TableCell>
                      <TableCell>
                        {committee.passThreshold ? (
                          <Badge variant="outline" className="font-bold text-primary border-primary/30">
                            {committee.passThreshold}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={committee.status === 'active' ? 'default' : 'secondary'}
                          className={committee.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                        >
                          {committee.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(committee.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManageMembers(committee)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Manage Members
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageCriteria(committee)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Assessment Criteria
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCommittee(committee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCommittee(committee.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {!loadingCommittees && filteredCommittees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No committees found matching the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create/Edit Committee Dialog */}
      {showCommitteeDialog && (
        <Dialog open={showCommitteeDialog} onOpenChange={setShowCommitteeDialog}>
          <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden p-0">
            <DialogHeader className="shrink-0 border-b px-6 py-4">
              <DialogTitle>{isEditing ? 'Edit Committee' : 'Create Committee'}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Committee Name <span className="text-red-600">*</span></Label>
                <Input 
                  id="name"
                  value={currentCommittee.name}
                  onChange={(e) => {
                    setCurrentCommittee({...currentCommittee, name: e.target.value});
                    setCommitteeFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Startup Assessment Committee"
                />
                {committeeFormErrors.name ? (
                  <p className="text-sm text-red-600">{committeeFormErrors.name}</p>
                ) : null}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={currentCommittee.description}
                  onChange={(e) => {
                    setCurrentCommittee({...currentCommittee, description: e.target.value});
                    setCommitteeFormErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="Describe the committee's purpose and responsibilities"
                  rows={3}
                />
                {committeeFormErrors.description ? (
                  <p className="text-sm text-red-600">{committeeFormErrors.description}</p>
                ) : null}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity Type <span className="text-red-600">*</span></Label>
                  <Select 
                    value={currentCommittee.entityType}
                    onValueChange={(value) => setCurrentCommittee({...currentCommittee, entityType: value})}
                  >
                    <SelectTrigger id="entityType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="ecosystem">Ecosystem Builder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="approvals">Required Approvals <span className="text-red-600">*</span></Label>
                  <Input 
                    id="approvals"
                    type="number"
                    min={0}
                    max={requiredApprovalsMax}
                    value={requiredApprovalsInput}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setRequiredApprovalsInput(nextValue);
                      setCommitteeFormErrors((prev) => ({ ...prev, requiredApprovals: undefined }));
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required approvals can be from 0 up to {requiredApprovalsMax} based on the total assigned members.
                  </p>
                  {committeeFormErrors.requiredApprovals ? (
                    <p className="text-sm text-red-600">{committeeFormErrors.requiredApprovals}</p>
                  ) : null}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status <span className="text-red-600">*</span></Label>
                <Select 
                  value={currentCommittee.status}
                  onValueChange={(value) => setCurrentCommittee({...currentCommittee, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base font-semibold">Committee Assignments</Label>
                  <div className="space-y-2">
                    <Label>Chairman <span className="text-red-600">*</span></Label>
                    {createChairMember ? (
                      <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {createChairMember.firstName} {createChairMember.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {createChairMember.email}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreateChairMember(null);
                            setCommitteeFormErrors((prev) => ({ ...prev, chairman: undefined }));
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                        Select exactly one user as chairman.
                      </div>
                    )}
                    {committeeFormErrors.chairman ? (
                      <p className="text-sm text-red-600">{committeeFormErrors.chairman}</p>
                    ) : null}

                    <Label>Assign Members <span className="text-red-600">*</span></Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or phone..."
                        className="pl-8"
                        value={createMemberSearch}
                        onFocus={() => setCreatePickerOpen(true)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCreateMemberSearch(v);
                          setCreatePickerOpen(true);
                          fetchCreateMembers(v);
                        }}
                      />
                    </div>
                    {committeeFormErrors.members ? (
                      <p className="text-sm text-red-600">{committeeFormErrors.members}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      The chairman counts as a member. You can create the committee with only the chairman, or add more members.
                    </p>

                    {createSelectedMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {createSelectedMembers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                          >
                            <div className="max-w-[220px] truncate">
                              {u.firstName} {u.lastName} ({u.email})
                            </div>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setCreateSelectedMembers((prev) => prev.filter((x) => x.id !== u.id));
                                if (createChairMember?.id === u.id) {
                                  setCreateChairMember(null);
                                }
                              }}
                              aria-label="Remove"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {createPickerOpen ? (
                      <div className="rounded-md border">
                        <div className="flex items-center justify-between border-b px-3 py-2 text-sm">
                          <span className="text-muted-foreground">
                            {createSelectedMembers.length} selected{createChairMember ? ' • 1 chairman' : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={allCreateResultsSelected ? handleClearCreateMembers : handleSelectAllCreateMembers}
                              disabled={createMemberResults.length === 0}
                            >
                              {allCreateResultsSelected ? 'Clear visible' : 'Select all visible'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => {
                                setCreateSelectedMembers([]);
                                setCreateChairMember(null);
                                setCommitteeFormErrors((prev) => ({ ...prev, members: undefined, chairman: undefined }));
                                setCreatePickerOpen(false);
                              }}
                              disabled={createSelectedMembers.length === 0 && !createChairMember}
                            >
                              Clear all
                            </Button>
                          </div>
                        </div>

                        {createMemberLoading ? (
                          <div className="flex items-center px-3 py-4 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </div>
                        ) : null}

                        {!createMemberLoading && createMemberResults.length > 0 ? (
                          <div className="max-h-72 overflow-auto">
                            {createMemberResults.map((u) => {
                              const selected = createSelectedMembers.some((x) => x.id === u.id);
                              const isChairman = createChairMember?.id === u.id;
                              return (
                                <label
                                  key={u.id}
                                  className={`flex cursor-pointer items-start gap-3 border-b px-3 py-3 text-sm last:border-b-0 hover:bg-muted/50 ${selected ? 'bg-muted/50' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4"
                                    checked={selected}
                                    onChange={() => toggleCreateMemberSelection(u)}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium">
                                      {u.firstName} {u.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {u.email}{u.phoneNumber ? ` • ${u.phoneNumber}` : ''}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant={isChairman ? "default" : "outline"}
                                    size="sm"
                                    className="shrink-0"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      setCreateChairMember(u);
                                      setCreateSelectedMembers((prev) =>
                                        prev.some((member) => member.id === u.id) ? prev : [...prev, u],
                                      );
                                      setCommitteeFormErrors((prev) => ({ ...prev, members: undefined }));
                                      setCommitteeFormErrors((prev) => ({ ...prev, chairman: undefined }));
                                    }}
                                  >
                                    {isChairman ? 'Chairman' : 'Set chairman'}
                                  </Button>
                                </label>
                              );
                            })}
                          </div>
                        ) : null}

                        {!createMemberLoading && createMemberResults.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-muted-foreground">
                            No committee members found.
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
              </div>
              </div>
            </div>
            
            <DialogFooter className="shrink-0 border-t px-6 py-4">
              <Button variant="outline" onClick={() => setShowCommitteeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCommittee} disabled={savingCommittee}>
                {savingCommittee ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? 'Save Changes' : 'Create Committee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this committee? This action cannot be undone and will remove all associated assessment criteria.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-5xl flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>Manage Committee Members</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
              <h3 className="text-lg font-medium">{currentCommittee.name}</h3>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users to add..."
                    className="pl-8"
                    value={eligibleSearch}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEligibleSearch(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchEligibleUsers(eligibleSearch);
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => fetchEligibleUsers(eligibleSearch)}
                  disabled={eligibleLoading}
                >
                  {eligibleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Add
                </Button>
              </div>
            </div>

            <div className="mb-4 rounded-md border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium">Member rules</p>
              <p className="text-muted-foreground">
                A committee must always have exactly one chairman. Promoting a member to chairman will replace the current chairman. You cannot unassign or demote the only chairman until another member is set as chairman.
              </p>
            </div>

            {memberManagementError ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {memberManagementError}
              </div>
            ) : null}

            {eligibleUsers.length > 0 ? (
              <div className="mb-4 rounded-md border p-3">
                <div className="text-sm font-medium mb-2">Search results</div>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {eligibleUsers.map((u) => {
                    const alreadyAssigned = members.some((member) => member.userId === u.id);

                    return (
                      <div key={u.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          {alreadyAssigned ? (
                            <div className="text-xs text-amber-600">Already assigned to this committee</div>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!currentCommittee.id) return;
                            setMemberActionLoading(u.id);
                            setMemberManagementError(null);
                            try {
                              const res = await addCommitteeMember({
                                committeeId: currentCommittee.id,
                                userId: u.id,
                                memberRole: "member",
                              });
                              if (!res.success) {
                                setMemberManagementError(res.message || "Failed to add member");
                                toast.error(res.message || "Failed to add member");
                                return;
                              }
                              toast.success("Member added (committee role assigned)");
                              const refresh = await getCommitteeMembers(currentCommittee.id);
                              if (refresh.success) setMembers(refresh.data as any);
                              await fetchCommittees();
                            } finally {
                              setMemberActionLoading(null);
                            }
                          }}
                          disabled={memberActionLoading === u.id || alreadyAssigned}
                        >
                          {memberActionLoading === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : alreadyAssigned ? "Assigned" : "Add"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
            
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Committee Role</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10">
                        <div className="flex items-center justify-center text-muted-foreground">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading members...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!membersLoading
                    ? members.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">
                                  {m.user.firstName} {m.user.lastName}
                                </div>
                                {m.memberRole === 'chair' ? (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    Current chairman
                                  </Badge>
                                ) : null}
                              </div>
                              <div className="text-xs text-muted-foreground">{m.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                            <Select
                              value={m.memberRole}
                              onValueChange={async (val) => {
                                setMemberActionLoading(m.id);
                                setMemberManagementError(null);
                                try {
                                  const res = await updateCommitteeMemberRole(m.id, val as any);
                                  if (!res.success) {
                                    setMemberManagementError(res.message || "Failed to update role");
                                    toast.error(res.message || "Failed to update role");
                                    return;
                                  }
                                  toast.success("Member role updated");

                                  setMembers((prev) => {
                                    if (val === 'chair') {
                                      return prev.map((member) => ({
                                        ...member,
                                        memberRole: member.id === m.id ? 'chair' : 'member',
                                      }));
                                    }

                                    return prev.map((member) =>
                                      member.id === m.id
                                        ? { ...member, memberRole: val as 'chair' | 'member' }
                                        : member,
                                    );
                                  });

                                  const refresh = await getCommitteeMembers(currentCommittee.id);
                                  if (refresh.success) {
                                    setMembers(refresh.data as any);
                                    setMemberManagementError(null);
                                  }
                                } finally {
                                  setMemberActionLoading(null);
                                }
                              }}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="chair">Chair</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                            {m.memberRole === 'chair' ? (
                              <p className="text-xs text-muted-foreground">
                                To replace the chairman, set another member to chair first.
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Select Chair to replace the current chairman.
                              </p>
                            )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{m.user.role}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(m.addedAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={async () => {
                                setMemberActionLoading(m.id);
                                setMemberManagementError(null);
                                try {
                                  const res = await removeCommitteeMember(m.id);
                                  if (!res.success) {
                                    setMemberManagementError(res.message || "Failed to remove member");
                                    toast.error(res.message || "Failed to remove member");
                                    return;
                                  }
                                  toast.success("Member removed");
                                  setMembers((prev) => prev.filter((x) => x.id !== m.id));
                                } finally {
                                  setMemberActionLoading(null);
                                }
                              }}
                              disabled={memberActionLoading === m.id}
                              title={
                                m.id === activeChairMemberId
                                  ? 'Assign another chairman first, then unassign this chairman'
                                  : 'Unassign member'
                              }
                            >
                              {memberActionLoading === m.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    : null}

                  {!membersLoading && members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No members yet
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button onClick={() => setShowMembersDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assessment Criteria Dialog */}
      <Dialog
        open={showCriteriaDialog}
        onOpenChange={(open) => {
          setShowCriteriaDialog(open);

          if (!open) {
            setCurrentCriteria({ id: '', name: '', description: '', weight: 20 });
            setCriteriaFormOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assessment Criteria</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{currentCommittee.name}</h3>
              <div className="flex gap-2">
                {presetOptions.length > 0 && (
                  <div className="flex gap-1">
                    {presetOptions.map((preset) => (
                      <Button
                        key={preset.key}
                        variant="outline"
                        size="sm"
                        disabled={presetLoading}
                        onClick={async () => {
                          if (!confirm(`Load "${preset.label}"? This will replace all existing criteria.`)) return;
                          setPresetLoading(true);
                          try {
                            const res = await loadDirectivePreset(currentCommittee.id, preset.key);
                            if (!res.success) {
                              toast.error(res.message || "Failed to load preset");
                              return;
                            }
                            toast.success(`Loaded: ${preset.label}`);
                            const refresh = await getCommitteeCriteria(currentCommittee.id);
                            if (refresh.success) setCriteriaList(refresh.data as any);
                          } finally {
                            setPresetLoading(false);
                          }
                        }}
                      >
                        Load {preset.label.split("—")[1]?.trim() || preset.label}
                      </Button>
                    ))}
                  </div>
                )}
                <Button size="sm" onClick={handleAddCriteria}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criteria
                </Button>
              </div>
            </div>
            
            {criteriaFormOpen ? (
              <div className="bg-muted p-4 rounded-md mb-6">
                <h4 className="font-medium mb-3">{currentCriteria.id ? 'Edit' : 'New'} Criterion</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="criteriaName">Name</Label>
                      <Input 
                        id="criteriaName"
                        value={currentCriteria.name}
                        onChange={(e) => setCurrentCriteria({...currentCriteria, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (%)</Label>
                      <Input 
                        id="weight"
                        type="number"
                        min={1}
                        max={100}
                        value={currentCriteria.weight}
                        onChange={(e) => setCurrentCriteria({...currentCriteria, weight: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criteriaDesc">Description</Label>
                    <Textarea 
                      id="criteriaDesc"
                      value={currentCriteria.description}
                      onChange={(e) => setCurrentCriteria({...currentCriteria, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCurrentCriteria({id: '', name: '', description: '', weight: 20});
                        setCriteriaFormOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveCriteria} disabled={criteriaSaving}>
                      {criteriaSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save Criterion
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Weight (%)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteriaLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading criteria...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {criteriaList.map(criteria => {
                  const isPreset = !!(criteria as any).directivePreset;
                  return (
                  <TableRow key={criteria.id}>
                    <TableCell className="font-medium">
                      {criteria.name}
                      {isPreset && (
                        <Badge variant="outline" className="ml-2 text-[9px] bg-primary/5 text-primary border-primary/20 font-bold">
                          {(criteria as any).directiveRef}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{criteria.description}</TableCell>
                    <TableCell>{criteria.weight}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCriteria(criteria)} disabled={isPreset} title={isPreset ? "Preset criteria cannot be edited individually" : ""}>
                          <Edit className={`h-4 w-4 ${isPreset ? 'opacity-30' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={async () => {
                            setCriteriaSaving(true);
                            try {
                              const res = await deleteCommitteeCriterion(criteria.id);
                              if (!res.success) {
                                toast.error(res.message || "Failed to delete criterion");
                                return;
                              }
                              toast.success("Criterion deleted");
                              if (currentCommittee.id) {
                                const refresh = await getCommitteeCriteria(currentCommittee.id);
                                if (refresh.success) setCriteriaList(refresh.data as any);
                              }
                            } finally {
                              setCriteriaSaving(false);
                            }
                          }}
                          disabled={criteriaSaving || isPreset}
                          title={isPreset ? "Preset criteria cannot be deleted individually" : ""}
                        >
                          <Trash className={`h-4 w-4 ${isPreset ? 'opacity-30' : ''}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
                
                {!criteriaLoading && criteriaList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No assessment criteria defined for this committee
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowCriteriaDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
