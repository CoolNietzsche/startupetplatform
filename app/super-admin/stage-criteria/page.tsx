"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  getStageCriteria,
  saveStageCriteria,
  resetStageCriteria,
  type StageCriterion,
  type StagePresetData,
  type StageKey,
} from "./actions";

const STAGE_LABELS: Record<StageKey, string> = {
  INITIAL: "Initial Stage (Art. 22.1)",
  POST_INITIAL: "Post-Initial Stage (Art. 22.2)",
  SCALE_EXIT: "Scale & Exit Stage (Art. 22.3)",
};

const STAGE_DESCRIPTIONS: Record<StageKey, string> = {
  INITIAL: "2 years · Pass threshold: 70% · 7 criteria · Focus: early-stage validation",
  POST_INITIAL: "4 years · Pass threshold: 80% · 5 criteria · Focus: growth traction",
  SCALE_EXIT: "2 years · Pass threshold: 85% · 6 criteria · Focus: scaling & exit",
};

type TabStage = StageKey;

export default function StageCriteriaPage() {
  const [activeTab, setActiveTab] = useState<TabStage>("INITIAL");
  const [presets, setPresets] = useState<Record<StageKey, StagePresetData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [showCriterionDialog, setShowCriterionDialog] = useState(false);
  const [editingCriterionIndex, setEditingCriterionIndex] = useState<number | null>(null);
  const [criterionForm, setCriterionForm] = useState<StageCriterion>({
    name: "",
    description: "",
    maxWeight: 10,
    directiveRef: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStageCriteria();
      if (res.success && res.data) {
        setPresets(res.data);
      } else {
        toast.error(res.message || "Failed to load stage criteria");
      }
    } finally {
      setLoading(false);
    }
  };

  const activePreset = presets?.[activeTab];
  const totalWeight = activePreset?.criteria.reduce((s, c) => s + (Number(c.maxWeight) || 0), 0) ?? 0;

  const handleAddCriterion = () => {
    setEditingCriterionIndex(null);
    setCriterionForm({ name: "", description: "", maxWeight: 10, directiveRef: "" });
    setShowCriterionDialog(true);
  };

  const handleEditCriterion = (index: number) => {
    setEditingCriterionIndex(index);
    setCriterionForm({ ...activePreset!.criteria[index] });
    setShowCriterionDialog(true);
  };

  const handleDeleteCriterion = (index: number) => {
    if (!presets) return;
    const updated = { ...presets };
    updated[activeTab] = {
      ...updated[activeTab],
      criteria: updated[activeTab].criteria.filter((_, i) => i !== index),
    };
    setPresets(updated);
  };

  const handleSaveCriterion = () => {
    if (!criterionForm.name.trim()) {
      toast.error("Criterion name is required");
      return;
    }
    if (!criterionForm.maxWeight || Number(criterionForm.maxWeight) < 1) {
      toast.error("Weight must be at least 1");
      return;
    }

    if (!presets) return;
    const updated = { ...presets };
    const criteria = [...updated[activeTab].criteria];

    if (editingCriterionIndex !== null) {
      criteria[editingCriterionIndex] = { ...criterionForm };
    } else {
      criteria.push({ ...criterionForm });
    }

    updated[activeTab] = { ...updated[activeTab], criteria };
    setPresets(updated);
    setShowCriterionDialog(false);
  };

  const handleSaveAll = async () => {
    if (!presets) return;
    setSaving(true);
    try {
      const res = await saveStageCriteria(presets);
      if (res.success) {
        toast.success("Stage criteria saved");
      } else {
        toast.error(res.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await resetStageCriteria();
      if (res.success) {
        toast.success("Reset to directive defaults");
        await loadData();
      } else {
        toast.error(res.message || "Failed to reset");
      }
    } finally {
      setResetting(false);
    }
  };

  const handlePassThresholdChange = (value: string) => {
    if (!presets) return;
    const num = Number(value);
    if (isNaN(num)) return;
    setPresets({
      ...presets,
      [activeTab]: { ...presets[activeTab], passThreshold: num },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-mint-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-brand-deep-dark">
            Stage Evaluation Criteria
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetting}
            className="h-10 px-6 rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
          >
            {resetting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-mint-teal/20"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All
          </Button>
        </div>
      </div>

      <Card className="border-2 rounded-2xl shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex border-b border-slate-200">
            {(["INITIAL", "POST_INITIAL", "SCALE_EXIT"] as TabStage[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === key
                    ? "border-brand-mint-teal text-brand-deep-dark"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {key === "INITIAL"
                  ? "Initial"
                  : key === "POST_INITIAL"
                  ? "Post-Initial"
                  : "Scale & Exit"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-brand-deep-dark">
                  {STAGE_LABELS[activeTab]}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {STAGE_DESCRIPTIONS[activeTab]}
                </p>
              </div>
              <Button
                onClick={handleAddCriterion}
                className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-bold h-9 px-4 rounded-xl text-xs shadow-lg shadow-brand-startup-amber/20"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Criterion
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold text-slate-600">Pass Threshold:</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={activePreset?.passThreshold ?? 70}
                  onChange={(e) => handlePassThresholdChange(e.target.value)}
                  className="w-20 h-9 text-center font-bold rounded-xl"
                />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
              <Badge
                className={`font-bold ${
                  totalWeight === 100
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {totalWeight === 100 ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                Total Weight: {totalWeight} / 100
              </Badge>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-[11px] text-slate-600 uppercase w-8">#</TableHead>
                    <TableHead className="font-bold text-[11px] text-slate-600 uppercase">Criterion</TableHead>
                    <TableHead className="font-bold text-[11px] text-slate-600 uppercase hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="font-bold text-[11px] text-slate-600 uppercase">Weight</TableHead>
                    <TableHead className="font-bold text-[11px] text-slate-600 uppercase hidden lg:table-cell">
                      Directive Ref
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePreset?.criteria.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-bold text-slate-400">{i + 1}</TableCell>
                      <TableCell>
                        <span className="font-bold text-sm text-brand-deep-dark">{c.name}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-slate-500 line-clamp-2">{c.description}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-bold text-sm bg-brand-mint-teal/5 border-brand-mint-teal/20"
                        >
                          {c.maxWeight}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                          {c.directiveRef}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-blue-50"
                            onClick={() => handleEditCriterion(i)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-red-50"
                            onClick={() => handleDeleteCriterion(i)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!activePreset || activePreset.criteria.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-slate-400 font-medium">
                        No criteria defined for this stage. Click "Add Criterion" to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCriterionDialog} onOpenChange={setShowCriterionDialog}>
        <DialogContent className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-w-lg">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-black text-brand-deep-dark">
              {editingCriterionIndex !== null ? "Edit Criterion" : "Add Criterion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="criterion-name">
                Criterion Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="criterion-name"
                value={criterionForm.name}
                onChange={(e) => setCriterionForm({ ...criterionForm, name: e.target.value })}
                placeholder="e.g. Problem Identification"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterion-desc">Description</Label>
              <Textarea
                id="criterion-desc"
                value={criterionForm.description}
                onChange={(e) => setCriterionForm({ ...criterionForm, description: e.target.value })}
                placeholder="Describe what this criterion evaluates"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="criterion-weight">
                  Weight <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="criterion-weight"
                  type="number"
                  min={1}
                  max={100}
                  value={criterionForm.maxWeight}
                  onChange={(e) =>
                    setCriterionForm({ ...criterionForm, maxWeight: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criterion-ref">Directive Reference</Label>
                <Input
                  id="criterion-ref"
                  value={criterionForm.directiveRef}
                  onChange={(e) =>
                    setCriterionForm({ ...criterionForm, directiveRef: e.target.value })
                  }
                  placeholder="e.g. 22.1(a)"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 gap-3">
            <Button
              variant="ghost"
              className="h-11 px-8 rounded-xl font-bold text-xs text-slate-500"
              onClick={() => setShowCriterionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-brand-mint-teal/20 text-xs"
              onClick={handleSaveCriterion}
            >
              {editingCriterionIndex !== null ? "Update Criterion" : "Add Criterion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
