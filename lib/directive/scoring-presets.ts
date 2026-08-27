export interface DirectiveCriterion {
  name: string;
  description: string;
  maxWeight: number;
  directiveRef: string;
}

export interface ScoringPreset {
  type: "startup" | "ecosystem";
  label: string;
  directiveStage?: "INITIAL" | "POST_INITIAL" | "SCALE_EXIT";
  directiveBuilderType?:
    | "INCUBATOR"
    | "ACCELERATOR"
    | "COWORKING"
    | "VENTURE_CAPITAL"
    | "ANGEL_INVESTOR";
  passThreshold: number;
  criteria: DirectiveCriterion[];
}

export const SCORING_PRESETS: Record<string, ScoringPreset> = {
  STARTUP_INITIAL: {
    type: "startup",
    label: "Startup — Initial Stage (Art. 22.1)",
    directiveStage: "INITIAL",
    passThreshold: 70,
    criteria: [
      {
        name: "Problem Identification",
        description:
          "Has identified a real problem or gap in the market (Art. 22.1(a))",
        maxWeight: 30,
        directiveRef: "22.1(a)",
      },
      {
        name: "Solution Development",
        description:
          "Has developed a solution to address the identified problem (Art. 22.1(b))",
        maxWeight: 10,
        directiveRef: "22.1(b)",
      },
      {
        name: "Organized Team",
        description:
          "Has an organized founding team with supporting documents (Art. 22.1(c))",
        maxWeight: 10,
        directiveRef: "22.1(c)",
      },
      {
        name: "Basic Prototype",
        description:
          "Has a basic product or service prototype ready for market testing (Art. 22.1(d))",
        maxWeight: 15,
        directiveRef: "22.1(d)",
      },
      {
        name: "Market Entry & PMF",
        description:
          "Has a market entry strategy and first-round PMF validation (Art. 22.1(e))",
        maxWeight: 10,
        directiveRef: "22.1(e)",
      },
      {
        name: "Pivot Evidence",
        description:
          "Demonstrates ability to pivot based on market feedback (Art. 22.1(f))",
        maxWeight: 10,
        directiveRef: "22.1(f)",
      },
      {
        name: "Funding Secured",
        description:
          "Has secured funding from founder/family/friends/investors/grants (Art. 22.1(g))",
        maxWeight: 15,
        directiveRef: "22.1(g)",
      },
    ],
  },

  STARTUP_POST_INITIAL: {
    type: "startup",
    label: "Startup — Post-Initial Stage (Art. 22.2)",
    directiveStage: "POST_INITIAL",
    passThreshold: 80,
    criteria: [
      {
        name: "PMF & User Demand",
        description:
          "Demonstrates continuous user demand with PMF evidence (Art. 22.2(a))",
        maxWeight: 25,
        directiveRef: "22.2(a)",
      },
      {
        name: "Business Model & Market Strategy",
        description:
          "Has an organized business model and market entry strategy (Art. 22.2(b))",
        maxWeight: 15,
        directiveRef: "22.2(b)",
      },
      {
        name: "Revenue & Economic Value",
        description:
          "Generating revenue and creating economic value (Art. 22.2(c))",
        maxWeight: 20,
        directiveRef: "22.2(c)",
      },
      {
        name: "Funding & Investment",
        description:
          "Has secured external funding or is self-sustaining (Art. 22.2(d))",
        maxWeight: 20,
        directiveRef: "22.2(d)",
      },
      {
        name: "Team Expansion",
        description:
          "Growing team beyond founders or leveraging alternative technology (Art. 22.2(e))",
        maxWeight: 20,
        directiveRef: "22.2(e)",
      },
    ],
  },

  STARTUP_SCALE_EXIT: {
    type: "startup",
    label: "Startup — Scale & Exit Stage (Art. 22.3)",
    directiveStage: "SCALE_EXIT",
    passThreshold: 85,
    criteria: [
      {
        name: "Business Expansion",
        description:
          "Business expanding domestically, regionally, or globally (Art. 22.3(a))",
        maxWeight: 25,
        directiveRef: "22.3(a)",
      },
      {
        name: "Market Disruption",
        description:
          "Demonstrates disruptive market share growth (Art. 22.3(b))",
        maxWeight: 15,
        directiveRef: "22.3(b)",
      },
      {
        name: "Team & Structural Transition",
        description:
          "Increased staffing or alternative tech capacity for scale (Art. 22.3(c))",
        maxWeight: 10,
        directiveRef: "22.3(c)",
      },
      {
        name: "Scale Funding",
        description:
          "Has secured funding from investors for scaling (Art. 22.3(d))",
        maxWeight: 20,
        directiveRef: "22.3(d)",
      },
      {
        name: "Strategic Partnerships",
        description:
          "Has investor/ecosystem/strategic partnerships and growth strategy (Art. 22.3(e))",
        maxWeight: 15,
        directiveRef: "22.3(e)",
      },
      {
        name: "Exit Readiness",
        description:
          "Ready for IPO, acquisition, or merger (Art. 22.3(f))",
        maxWeight: 15,
        directiveRef: "22.3(f)",
      },
    ],
  },

  ECOSYSTEM_INCUBATOR: {
    type: "ecosystem",
    label: "Ecosystem Builder — Incubator (Art. 28.1)",
    directiveBuilderType: "INCUBATOR",
    passThreshold: 85,
    criteria: [
      {
        name: "Early-Stage Programs",
        description:
          "Supports early-stage startups with business/technical/legal/financial programs (Art. 28.1(a))",
        maxWeight: 30,
        directiveRef: "28.1(a)",
      },
      {
        name: "Experienced Professionals",
        description:
          "At least 3 experienced professionals with startup industry expertise (Art. 28.1(b))",
        maxWeight: 15,
        directiveRef: "28.1(b)",
      },
      {
        name: "Incubation Program Quality",
        description:
          "Minimum 6-month program with evaluation and monitoring system (Art. 28.1(c))",
        maxWeight: 15,
        directiveRef: "28.1(c)",
      },
      {
        name: "Facilities & Infrastructure",
        description:
          "Adequate workspace, equipment, and infrastructure aligned to startup needs (Art. 28.1(d))",
        maxWeight: 20,
        directiveRef: "28.1(d)",
      },
      {
        name: "Investment Terms",
        description:
          "Clear investment agreement with defined profit-sharing terms (Art. 28.1(e))",
        maxWeight: 10,
        directiveRef: "28.1(e)",
      },
      {
        name: "Fund Connections",
        description:
          "Connections with domestic and international fund providers (Art. 28.1(f))",
        maxWeight: 10,
        directiveRef: "28.1(f)",
      },
    ],
  },

  ECOSYSTEM_ACCELERATOR: {
    type: "ecosystem",
    label: "Ecosystem Builder — Accelerator (Art. 28.2)",
    directiveBuilderType: "ACCELERATOR",
    passThreshold: 85,
    criteria: [
      {
        name: "Growth-Stage Programs",
        description:
          "Supports post-initial+ startups with growth/scaling/investment readiness programs (Art. 28.2(a))",
        maxWeight: 25,
        directiveRef: "28.2(a)",
      },
      {
        name: "Experienced Professionals",
        description:
          "At least 3 experienced professionals with startup industry expertise (Art. 28.2(b))",
        maxWeight: 15,
        directiveRef: "28.2(b)",
      },
      {
        name: "Accelerator Program Quality",
        description:
          "Minimum 3-month program with evaluation and monitoring system (Art. 28.2(c))",
        maxWeight: 15,
        directiveRef: "28.2(c)",
      },
      {
        name: "Facilities & Platform",
        description:
          "Adequate workspace, equipment, or digital connectivity platform (Art. 28.2(d))",
        maxWeight: 20,
        directiveRef: "28.2(d)",
      },
      {
        name: "Investment Terms",
        description:
          "Clear investment agreement with defined profit-sharing terms (Art. 28.2(e))",
        maxWeight: 15,
        directiveRef: "28.2(e)",
      },
      {
        name: "Fund Connections",
        description:
          "Connections with domestic and international fund providers (Art. 28.2(f))",
        maxWeight: 10,
        directiveRef: "28.2(f)",
      },
    ],
  },

  ECOSYSTEM_COWORKING: {
    type: "ecosystem",
    label: "Ecosystem Builder — Co-working Space (Art. 28.3)",
    directiveBuilderType: "COWORKING",
    passThreshold: 85,
    criteria: [
      {
        name: "Experienced Professionals",
        description:
          "At least 3 experienced professionals managing the space (Art. 28.3(a))",
        maxWeight: 30,
        directiveRef: "28.3(a)",
      },
      {
        name: "Membership & Community",
        description:
          "Startup membership, community building, and professional services (Art. 28.3(b))",
        maxWeight: 20,
        directiveRef: "28.3(b)",
      },
      {
        name: "Workspace & Equipment",
        description:
          "Adequate workspace, equipment, and digital connectivity (Art. 28.3(c))",
        maxWeight: 50,
        directiveRef: "28.3(c)",
      },
    ],
  },

  ECOSYSTEM_VENTURE_CAPITAL: {
    type: "ecosystem",
    label: "Ecosystem Builder — Venture Capital (Art. 28.4)",
    directiveBuilderType: "VENTURE_CAPITAL",
    passThreshold: 85,
    criteria: [
      {
        name: "VC Investment Programs",
        description:
          "Supports post-initial+ startups with investment, risk management, and growth support (Art. 28.4(a))",
        maxWeight: 25,
        directiveRef: "28.4(a)",
      },
      {
        name: "Experienced Professionals",
        description:
          "At least 3 experienced professionals with startup industry expertise (Art. 28.4(b))",
        maxWeight: 20,
        directiveRef: "28.4(b)",
      },
      {
        name: "VC Track Record",
        description:
          "Minimum 5-year track record with evaluation and monitoring system (Art. 28.4(c))",
        maxWeight: 20,
        directiveRef: "28.4(c)",
      },
      {
        name: "Investment Infrastructure",
        description:
          "Staged investment structure, workspace, equipment, or digital platform (Art. 28.4(d))",
        maxWeight: 15,
        directiveRef: "28.4(d)",
      },
      {
        name: "Investment Terms",
        description:
          "Clear investment agreement with defined profit-sharing terms (Art. 28.4(e))",
        maxWeight: 10,
        directiveRef: "28.4(e)",
      },
      {
        name: "Fund Connections",
        description:
          "Connections with domestic and international fund providers (Art. 28.4(f))",
        maxWeight: 10,
        directiveRef: "28.4(f)",
      },
    ],
  },

  ECOSYSTEM_ANGEL_INVESTOR: {
    type: "ecosystem",
    label: "Ecosystem Builder — Angel Investor (Art. 28.5)",
    directiveBuilderType: "ANGEL_INVESTOR",
    passThreshold: 85,
    criteria: [
      {
        name: "Investment Readiness",
        description:
          "Demonstrates investment readiness, risk analysis, and monitoring (Art. 28.5(a))",
        maxWeight: 20,
        directiveRef: "28.5(a)",
      },
      {
        name: "Market Expansion & Mentorship",
        description:
          "Provides market expansion training and advisory services (Art. 28.5(b))",
        maxWeight: 15,
        directiveRef: "28.5(b)",
      },
      {
        name: "VC Readiness Programs",
        description:
          "Prepares startups for VC investment with transition support (Art. 28.5(c))",
        maxWeight: 15,
        directiveRef: "28.5(c)",
      },
      {
        name: "Organized Structure",
        description:
          "At least 2 professionals (incl. the angel) managing the program (Art. 28.5(d))",
        maxWeight: 15,
        directiveRef: "28.5(d)",
      },
      {
        name: "Monitoring & Evaluation",
        description:
          "Has evaluation, communication, and monitoring system (Art. 28.5(e))",
        maxWeight: 15,
        directiveRef: "28.5(e)",
      },
      {
        name: "Exit Profit Sharing",
        description:
          "Has defined profit-sharing from post-exit success (Art. 28.5(f))",
        maxWeight: 5,
        directiveRef: "28.5(f)",
      },
      {
        name: "Angel Investment Infrastructure",
        description:
          "Staged investment structure with workspace/platform (Art. 28.5(g))",
        maxWeight: 5,
        directiveRef: "28.5(g)",
      },
      {
        name: "Investment Terms",
        description:
          "Clear investment agreement with defined profit-sharing terms (Art. 28.5(h))",
        maxWeight: 5,
        directiveRef: "28.5(h)",
      },
      {
        name: "Fund Connections",
        description:
          "Connections with domestic and international fund providers (Art. 28.5(i))",
        maxWeight: 5,
        directiveRef: "28.5(i)",
      },
    ],
  },
};

export function getPresetKeys(): string[] {
  return Object.keys(SCORING_PRESETS);
}

export function getPresetsByType(type: "startup" | "ecosystem"): Record<
  string,
  ScoringPreset
> {
  return Object.fromEntries(
    Object.entries(SCORING_PRESETS).filter(([, p]) => p.type === type),
  );
}

export function getPreset(key: string): ScoringPreset | undefined {
  return SCORING_PRESETS[key];
}

export function validateWeightTotal(
  criteria: { weight: number }[],
): { valid: boolean; total: number } {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  return { valid: total === 100, total };
}

export function validateScore(
  weightEvaluation: number,
  maxWeight: number,
): { valid: boolean; percentage: number } {
  const clamped = Math.max(0, Math.min(maxWeight, weightEvaluation));
  const percentage = maxWeight > 0 ? (clamped / maxWeight) * 100 : 0;
  return { valid: clamped >= 0 && clamped <= maxWeight, percentage };
}

export function calculateTotalPercentage(
  scores: { weightEvaluation: number }[],
): number {
  return scores.reduce((sum, s) => sum + s.weightEvaluation, 0);
}

export function meetsThreshold(
  totalPercentage: number,
  threshold: number,
): boolean {
  return totalPercentage >= threshold;
}
