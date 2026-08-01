import mongoose, { Schema, Document } from 'mongoose';

// Referral Rules Interface & Schema
export interface IReferralRule extends Document {
  ruleName: string;
  signupBonusCoins: number;
  contestCommissionPercent: number;
  maxReferralsPerUserDay: number;
  minWithdrawalBalance: number;
  tier1Percent: number;
  tier2Percent: number;
  status: string;
}

const ReferralRuleSchema: Schema = new Schema(
  {
    ruleName: { type: String, required: true, default: 'Standard Referral Program' },
    signupBonusCoins: { type: Number, default: 100 },
    contestCommissionPercent: { type: Number, default: 5 },
    maxReferralsPerUserDay: { type: Number, default: 20 },
    minWithdrawalBalance: { type: Number, default: 200 },
    tier1Percent: { type: Number, default: 5 },
    tier2Percent: { type: Number, default: 2 },
    status: { type: String, default: 'Active' }
  },
  { timestamps: true }
);

export const ReferralRule = mongoose.model<IReferralRule>('ReferralRule', ReferralRuleSchema);

// Referral Transaction Interface & Schema
export interface IReferralTransaction extends Document {
  referrerCode: string;
  referrerUser: string;
  referredUser: string;
  earningAmount: number;
  bonusType: string;
  status: string;
}

const ReferralTransactionSchema: Schema = new Schema(
  {
    referrerCode: { type: String, required: true, uppercase: true, index: true },
    referrerUser: { type: String, required: true },
    referredUser: { type: String, required: true },
    earningAmount: { type: Number, required: true, default: 0 },
    bonusType: { type: String, default: 'Signup Bonus' },
    status: { type: String, default: 'Credited' }
  },
  { timestamps: true }
);

export const ReferralTransaction = mongoose.model<IReferralTransaction>('ReferralTransaction', ReferralTransactionSchema);

// Referral Abuse Log Interface & Schema
export interface IReferralAbuseLog extends Document {
  userId: string;
  userName: string;
  ipAddress: string;
  deviceFingerprint: string;
  fraudReason: string;
  riskScore: number;
  status: string;
}

const ReferralAbuseLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: 'Anonymous User' },
    ipAddress: { type: String, required: true },
    deviceFingerprint: { type: String, default: 'N/A' },
    fraudReason: { type: String, default: 'Multiple Accounts on Same IP' },
    riskScore: { type: Number, default: 85 },
    status: { type: String, default: 'Flagged', index: true }
  },
  { timestamps: true }
);

export const ReferralAbuseLog = mongoose.model<IReferralAbuseLog>('ReferralAbuseLog', ReferralAbuseLogSchema);
