import { FileText, Clock, Search, Users, CheckCircle2, Award, XCircle } from "lucide-react";

export type EcosystemApplicationStatus =
  | "DRAFT"
  | "PENDING"
  | "UNDER_REVIEW"
  | "REVIEWED"
  | "CLARIFICATION_REQUESTED"
  | "ASSIGNED_TO_COMMITTEE"
  | "IN_COMMITTEE_REVIEW"
  | "COMMITTEE_REVIEW_SUBMITTED"
  | "CERTIFIED"
  | "REJECTED";

export interface WorkflowStep {
  status: EcosystemApplicationStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    status: "DRAFT",
    label: "Draft",
    description: "Application is being drafted",
    icon: FileText,
  },
  {
    status: "PENDING",
    label: "Pending Review",
    description: "Application submitted and awaiting initial review",
    icon: Clock,
  },
  {
    status: "UNDER_REVIEW",
    label: "Under Review",
    description: "Application is being reviewed by MinT",
    icon: Search,
  },
  {
    status: "ASSIGNED_TO_COMMITTEE",
    label: "Assigned to Committee",
    description: "Application assigned to committee for evaluation",
    icon: Users,
  },
  {
    status: "IN_COMMITTEE_REVIEW",
    label: "Committee Review",
    description: "Committee is evaluating the application",
    icon: Clock,
  },
  {
    status: "COMMITTEE_REVIEW_SUBMITTED",
    label: "Committee Approved",
    description: "Committee has approved the application",
    icon: CheckCircle2,
  },
  {
    status: "CERTIFIED",
    label: "Certified",
    description: "Ecosystem builder certification granted",
    icon: Award,
  },
  {
    status: "REJECTED",
    label: "Rejected",
    description: "Application has been rejected",
    icon: XCircle,
  },
];
