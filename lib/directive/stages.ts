export type StageType = "INITIAL" | "POST_INITIAL" | "SCALE_EXIT";

export interface StageConfig {
  stage: StageType;
  label: string;
  durationYears: number;
  passThreshold: number;
  secondRenewalThreshold?: number;
  directiveRef: string;
  allowsRenewal: boolean;
  nextStage: StageType | null;
}

export const STAGE_CONFIG: Record<StageType, StageConfig> = {
  INITIAL: {
    stage: "INITIAL",
    label: "Initial Stage",
    durationYears: 2,
    passThreshold: 70,
    directiveRef: "Art. 21.1, 22.1",
    allowsRenewal: true,
    nextStage: "POST_INITIAL",
  },
  POST_INITIAL: {
    stage: "POST_INITIAL",
    label: "Post-Initial Stage",
    durationYears: 4,
    passThreshold: 80,
    secondRenewalThreshold: 75,
    directiveRef: "Art. 21.2, 22.2",
    allowsRenewal: true,
    nextStage: "SCALE_EXIT",
  },
  SCALE_EXIT: {
    stage: "SCALE_EXIT",
    label: "Scale & Exit Stage",
    durationYears: 2,
    passThreshold: 85,
    directiveRef: "Art. 21.3, 22.3",
    allowsRenewal: false,
    nextStage: null,
  },
};

export function getStageConfig(stage: StageType): StageConfig {
  return STAGE_CONFIG[stage];
}

export function getThresholdForStage(stage: StageType, isSecondRenewal?: boolean): number {
  const config = STAGE_CONFIG[stage];
  if (stage === "POST_INITIAL" && isSecondRenewal && config.secondRenewalThreshold) {
    return config.secondRenewalThreshold;
  }
  return config.passThreshold;
}

export function computeExpiryDate(issuedAt: Date, stage: StageType): Date {
  const config = STAGE_CONFIG[stage];
  const expiry = new Date(issuedAt);
  expiry.setFullYear(expiry.getFullYear() + config.durationYears);
  return expiry;
}

export function isStageExpired(issuedAt: Date, stage: StageType): boolean {
  return new Date() > computeExpiryDate(issuedAt, stage);
}

export function getNextStage(currentStage: StageType): StageType | null {
  return STAGE_CONFIG[currentStage].nextStage;
}

export function canTransition(currentStage: StageType, targetStage: StageType): boolean {
  return STAGE_CONFIG[currentStage].nextStage === targetStage;
}

export function getDefaultStageForApplicationType(type: string): StageType {
  if (type === "RENEWAL") return "POST_INITIAL";
  return "INITIAL";
}
