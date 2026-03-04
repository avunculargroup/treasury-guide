export type EntityType = 'SMSF' | 'SOLE_TRADER' | 'NFP' | 'PRIVATE_COMPANY' | 'PUBLIC_COMPANY';

export type PhaseStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETE';

export type ChecklistItemStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';

export type FitScore = 'RECOMMENDED' | 'EXPLORE_FURTHER' | 'NOT_RECOMMENDED';

export type RiskAppetite = 'low' | 'medium' | 'high';

export type CashReserveBand = '<$100k' | '$100k-$500k' | '$500k-$2m' | '$2m-$10m' | '$10m+';

export type InvestmentHorizon = '<1yr' | '1-3yrs' | '3-5yrs' | '5yrs+';

export type PriorCryptoExposure = 'none' | 'some' | 'significant';

export type CustodyPreference = 'exchange' | 'third_party' | 'self_custody' | 'multi_sig';

export type AllocationApproach = 'dca' | 'lump_sum' | 'undecided';

export interface AssessmentResponses {
  riskAppetite: RiskAppetite;
  cashReserveBand: CashReserveBand;
  investmentHorizon: InvestmentHorizon;
  hasTreasuryPolicy: boolean;
  accountingSoftware: string;
  stakeholderConcerns: boolean;
  priorCryptoExposure: PriorCryptoExposure;
  boardApprovalRequired: boolean;
  listedEntity: boolean;
}

export interface PlanningResponses {
  custodyPreference: CustodyPreference;
  allocationApproach: AllocationApproach;
  accountingSoftware: string;
  targetAllocationPercent: number;
  boardApprovalRequired: boolean;
  hasExistingCryptoPolicy: boolean;
}

export interface FitAssessmentResult {
  fitScore: FitScore;
  fitSummary: string;
  riskFlags: string[];
}

export interface ChecklistCategory {
  name: string;
  description: string;
  items: ChecklistItemData[];
}

export interface ChecklistItemData {
  title: string;
  description: string;
  responsible: string;
  estimatedDays: number;
  order: number;
}

export interface ChecklistOutput {
  title: string;
  entityType: EntityType;
  generatedAt: string;
  categories: ChecklistCategory[];
}

export interface EntityGuidance {
  entityType: EntityType;
  regulatoryBodies: string[];
  keyLegislation: string[];
  keyConsiderations: string[];
  commonRisks: string[];
  recommendedProfessionals: string[];
}

export interface PhaseInfo {
  phase: number;
  title: string;
  description: string;
  status: PhaseStatus;
  route: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  phase?: number;
  createdAt: string;
}
