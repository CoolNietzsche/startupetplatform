export interface ComplianceEntry {
  article: string;
  title: string;
  priority: string;
  status: "IMPLEMENTED" | "PARTIAL" | "PLANNED";
  implementation: string;
  testFile: string;
}

export const COMPLIANCE_MATRIX: ComplianceEntry[] = [
  // ── Scoring Engine (P1) ──
  { article: "22.1", title: "Startup Initial Stage Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — STARTUP_INITIAL preset, 7 criteria, passThreshold 70%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "22.2", title: "Startup Post-Initial Stage Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — STARTUP_POST_INITIAL preset, 5 criteria, passThreshold 80%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "22.3", title: "Startup Scale & Exit Stage Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — STARTUP_SCALE_EXIT preset, 6 criteria, passThreshold 85%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "28.1", title: "Incubator Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — ECOSYSTEM_INCUBATOR preset, 6 criteria, passThreshold 85%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "28.2", title: "Accelerator Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — ECOSYSTEM_ACCELERATOR preset, 6 criteria, passThreshold 85%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "28.3", title: "Co-working Space Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — ECOSYSTEM_COWORKING preset, 3 criteria, passThreshold 85%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "28.4", title: "Venture Capital Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — ECOSYSTEM_VENTURE_CAPITAL preset, 6 criteria, passThreshold 85%", testFile: "tests/p1-scoring-verification.ts" },
  { article: "28.5", title: "Angel Investor Scoring", priority: "P1", status: "IMPLEMENTED", implementation: "lib/directive/scoring-presets.ts — ECOSYSTEM_ANGEL_INVESTOR preset, 9 criteria, passThreshold 85%", testFile: "tests/p1-scoring-verification.ts" },

  // ── Pre-Assessment (P2) ──
  { article: "7.1", title: "Startup Document Checklist", priority: "P2", status: "IMPLEMENTED", implementation: "lib/directive/pre-assessment.ts — 5 required documents with Art. 7.1 refs", testFile: "tests/p2-pre-assessment-verification.ts" },
  { article: "8.1", title: "Ecosystem Document Checklist", priority: "P2", status: "IMPLEMENTED", implementation: "lib/directive/pre-assessment.ts — 7 required documents with Art. 8.1 refs", testFile: "tests/p2-pre-assessment-verification.ts" },
  { article: "9.1", title: "5-Day SLA for Pre-Assessment", priority: "P2", status: "IMPLEMENTED", implementation: "lib/directive/pre-assessment.ts — computeSla() 5-day deadline, UI countdown timer, SLA breach indicator", testFile: "tests/p2-pre-assessment-verification.ts" },

  // ── Stages (P3) ──
  { article: "19", title: "Startup Lifecycle Stages", priority: "P3", status: "IMPLEMENTED", implementation: "lib/directive/stages.ts — INITIAL(2yr)/POST_INITIAL(4yr)/SCALE_EXIT(2yr)", testFile: "tests/p3-stage-verification.ts" },
  { article: "21", title: "Stage Transition Rules", priority: "P3", status: "IMPLEMENTED", implementation: "lib/directive/stages.ts — canTransition(), getNextStage(), stage-based expiry", testFile: "tests/p3-stage-verification.ts" },
  { article: "22", title: "Stage-Based Pass Thresholds", priority: "P3", status: "IMPLEMENTED", implementation: "lib/directive/stages.ts — getThresholdForStage(), secondRenewalThreshold 75%", testFile: "tests/p3-stage-verification.ts" },

  // ── CAC Oversight (P4) ──
  { article: "33", title: "Committee Accreditation Council", priority: "P4", status: "IMPLEMENTED", implementation: "lib/directive/cac-oversight.ts — CacMember, CommitteePerformance, health scores; UI page with committee table and CAC members", testFile: "tests/p4-cac-verification.ts" },
  { article: "34", title: "Committee Oversight Duties", priority: "P4", status: "IMPLEMENTED", implementation: "lib/directive/cac-oversight.ts — computeOverdueDays(), computeAvgCompletionDays(), computePassRate()", testFile: "tests/p4-cac-verification.ts" },

  // ── Conflict of Interest (P5) ──
  { article: "14", title: "Conflict of Interest Declaration", priority: "P5", status: "IMPLEMENTED", implementation: "lib/directive/conflict-of-interest.ts — CoiDeclaration, checkPotentialConflict(), Art.14.1(a-e) refs", testFile: "tests/p5-coi-verification.ts" },
  { article: "36", title: "COI Resolution (Recusal/Override)", priority: "P5", status: "IMPLEMENTED", implementation: "lib/directive/conflict-of-interest.ts — canProceedWithConflict(), requiresRecusal()", testFile: "tests/p5-coi-verification.ts" },

  // ── Quorum (P6) ──
  { article: "13", title: "Committee Quorum Requirements", priority: "P6", status: "IMPLEMENTED", implementation: "lib/directive/quorum.ts — Standard committee quorum 50% (min 3 members), emergency quorum 33%", testFile: "tests/p6-quorum-verification.ts" },
  { article: "33.3", title: "CAC Quorum & Voting Thresholds", priority: "P6", status: "IMPLEMENTED", implementation: "lib/directive/quorum.ts — CAC quorum 60% (min 5), approval 66%", testFile: "tests/p6-quorum-verification.ts" },

  // ── Suspension & Revocation (P7) ──
  { article: "24", title: "Grounds for Suspension", priority: "P7", status: "IMPLEMENTED", implementation: "lib/directive/suspension.ts — Art.24.1(a-b) non-compliance, operating standards", testFile: "tests/p7-suspension-verification.ts" },
  { article: "25", title: "Grounds for Revocation", priority: "P7", status: "IMPLEMENTED", implementation: "lib/directive/suspension.ts — Art.25.1(a-b) fraud, willful violation", testFile: "tests/p7-suspension-verification.ts" },
  { article: "30", title: "Minor Violations & Remedies", priority: "P7", status: "IMPLEMENTED", implementation: "lib/directive/suspension.ts — Art.30.1(a-b) report failure, operational changes", testFile: "tests/p7-suspension-verification.ts" },
  { article: "31", title: "Automatic Revocation Triggers", priority: "P7", status: "IMPLEMENTED", implementation: "lib/directive/suspension.ts — Art.31.1 license revocation triggers automatic revocation", testFile: "tests/p7-suspension-verification.ts" },

  // ── Reports (P8) ──
  { article: "19.5", title: "Startup Quarterly Progress Reports", priority: "P8", status: "IMPLEMENTED", implementation: "lib/directive/reports.ts — STARTUP_PROGRESS quarterly report requirement; admin tracking page with per-entity status", testFile: "tests/p8-p11-verification.ts" },
  { article: "20.5", title: "Incubation Quarterly Progress Reports", priority: "P8", status: "IMPLEMENTED", implementation: "lib/directive/reports.ts — INCUBATION_PROGRESS quarterly report requirement", testFile: "tests/p8-p11-verification.ts" },
  { article: "29.1", title: "Ecosystem Builder Annual Reports", priority: "P8", status: "IMPLEMENTED", implementation: "lib/directive/reports.ts — ECOSYSTEM_ANNUAL report requirement", testFile: "tests/p8-p11-verification.ts" },

  // ── Certificates (P9) ──
  { article: "10", title: "Certificate Issuance & Validity", priority: "P9", status: "IMPLEMENTED", implementation: "lib/directive/certificates.ts — 2-year validity, 90-day renewal window, 30-day grace period", testFile: "tests/p8-p11-verification.ts" },

  // ── Calls (P10) ──
  { article: "6", title: "Calls for Applications", priority: "P10", status: "IMPLEMENTED", implementation: "lib/directive/calls.ts — 30-day minimum window, status lifecycle, management page with create dialog", testFile: "tests/p8-p11-verification.ts" },

  // ── Registry (P11) ──
  { article: "8", title: "National Registry of Certified Entities", priority: "P11", status: "IMPLEMENTED", implementation: "lib/directive/registry.ts — RegistryEntry, RegistryStats, searchable admin page with regional breakdown", testFile: "tests/p8-p11-verification.ts" },
  { article: "10", title: "Registry Search & Filtering", priority: "P11", status: "IMPLEMENTED", implementation: "lib/directive/registry.ts — searchRegistry() by name, certificate number, region, sector", testFile: "tests/p8-p11-verification.ts" },

  // ── New: Confidentiality (Art. 12) ──
  { article: "12", title: "Confidentiality Obligations", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/confidentiality.ts — 6 data categories with retention periods, access control by role", testFile: "tests/p13-new-articles-verification.ts" },

  // ── New: Committee Procedures (Art. 15-18) ──
  { article: "15", title: "Meeting Scheduling & Notice", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/committee-procedures.ts — Art. 15: 7-day advance notice, meeting status lifecycle", testFile: "tests/p13-new-articles-verification.ts" },
  { article: "16", title: "Meeting Conduct & Agenda", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/committee-procedures.ts — Art. 16: agenda items, meeting minutes, decisions", testFile: "tests/p13-new-articles-verification.ts" },
  { article: "17", title: "Voting Procedures", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/committee-procedures.ts — Art. 17: tallyVotes(), majority rules, two-thirds for suspension/revocation", testFile: "tests/p13-new-articles-verification.ts" },
  { article: "18", title: "Decision Records & Minutes", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/committee-procedures.ts — Art. 18: MeetingDecision, VoteRecord types, outcome tracking", testFile: "tests/p13-new-articles-verification.ts" },

  // ── New: Monitoring (Art. 23) ──
  { article: "23", title: "Monitoring & Evaluation", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/monitoring.ts — inspection scheduling, finding severity, compliance scoring; admin page with log-finding dialog", testFile: "tests/p13-new-articles-verification.ts" },

  // ── New: Winding Up (Art. 26-27) ──
  { article: "26", title: "Voluntary Surrender of Designation", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/winding-up.ts — Art. 26: SurrenderRequest, 45-day review deadline", testFile: "tests/p13-new-articles-verification.ts" },
  { article: "27", title: "Winding Up Procedures", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/winding-up.ts — Art. 27: certificate revocation on approval, status tracking", testFile: "tests/p13-new-articles-verification.ts" },

  // ── New: Appeals (Art. 35) ──
  { article: "35", title: "Appeals Process", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/appeals.ts — 30-day filing deadline, 60-day review, UPHELD/DENIED/DISMISSED; admin page with decide dialog restoring status", testFile: "tests/p13-new-articles-verification.ts" },

  // ── New: Transitional (Art. 32) ──
  { article: "32", title: "Transitional Provisions", priority: "P13", status: "IMPLEMENTED", implementation: "lib/directive/transitional.ts — 180-day grace period, existing designation conversion tracking", testFile: "tests/p13-new-articles-verification.ts" },
];

export function getComplianceByArticle(article: string): ComplianceEntry | undefined {
  return COMPLIANCE_MATRIX.find(e => e.article === article);
}

export function getComplianceByPriority(priority: string): ComplianceEntry[] {
  return COMPLIANCE_MATRIX.filter(e => e.priority === priority);
}

export function getComplianceSummary(): { implemented: number; partial: number; planned: number; total: number } {
  return {
    implemented: COMPLIANCE_MATRIX.filter(e => e.status === "IMPLEMENTED").length,
    partial: COMPLIANCE_MATRIX.filter(e => e.status === "PARTIAL").length,
    planned: COMPLIANCE_MATRIX.filter(e => e.status === "PLANNED").length,
    total: COMPLIANCE_MATRIX.length,
  };
}
