import mongoose, { Schema, Document } from 'mongoose';

export interface ICoinSettings extends Document {
  coinRate: number;
  minRedeemCoins: number;
  maxDailyEarnLimit: number;
  signupBonus: number;
  dailyLoginBonus: number;
  referralSenderBonus: number;
  referralReceiverBonus: number;
  videoAdBonus: number;
  surveyBonus: number;
}

const CoinSettingsSchema: Schema = new Schema(
  {
    coinRate: { type: Number, default: 10 },
    minRedeemCoins: { type: Number, default: 100 },
    maxDailyEarnLimit: { type: Number, default: 500 },
    signupBonus: { type: Number, default: 50 },
    dailyLoginBonus: { type: Number, default: 10 },
    referralSenderBonus: { type: Number, default: 25 },
    referralReceiverBonus: { type: Number, default: 25 },
    videoAdBonus: { type: Number, default: 5 },
    surveyBonus: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export const CoinSettings = mongoose.model<ICoinSettings>('CoinSettings', CoinSettingsSchema);
export default CoinSettings;
