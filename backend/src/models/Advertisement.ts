import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  title: string;
  type: string; // 'sponsored', 'banner', 'video', 'reward', 'partner'
  sponsorName: string;
  sponsorLogo: string;
  mediaUrl: string;
  redirectUrl: string;
  placement: string;
  targetAudience: string;
  budget: number;
  spent: number;
  cpm: number;
  cpc: number;
  impressions: number;
  clicks: number;
  conversions: number;
  rewardPoints: number;
  rewardAmount: number;
  videoDuration: number;
  partnerCode: string;
  startDate: string;
  endDate: string;
  status: string; // 'Active', 'Paused', 'Ended', 'Draft'
}

const AdvertisementSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true, default: 'banner', index: true },
    sponsorName: { type: String, default: 'Brand Partner' },
    sponsorLogo: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    redirectUrl: { type: String, default: '' },
    placement: { type: String, default: 'Home Screen' },
    targetAudience: { type: String, default: 'All Users' },
    budget: { type: Number, default: 50000 },
    spent: { type: Number, default: 0 },
    cpm: { type: Number, default: 15 },
    cpc: { type: Number, default: 2.5 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 50 },
    rewardAmount: { type: Number, default: 5 },
    videoDuration: { type: Number, default: 15 },
    partnerCode: { type: Number, default: '' },
    startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    endDate: { type: String, default: '2026-12-31' },
    status: { type: String, default: 'Active', index: true }
  },
  { timestamps: true }
);

export const Advertisement = mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
