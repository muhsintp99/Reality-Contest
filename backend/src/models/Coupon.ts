import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: string; // 'promo', 'discount', 'free', 'reward'
  description: string;
  discountType: string; // 'percentage', 'flat', 'free_pass'
  discountValue: number;
  minContestFee: number;
  maxDiscountAmount: number;
  maxRedemptions: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  status: string; // 'Active', 'Expired', 'Disabled'
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, required: true, default: 'promo', index: true },
    description: { type: String, default: '' },
    discountType: { type: String, default: 'percentage' },
    discountValue: { type: Number, default: 10 },
    minContestFee: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 500 },
    maxRedemptions: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    validFrom: { type: String, default: () => new Date().toISOString().split('T')[0] },
    validUntil: { type: String, default: '2026-12-31' },
    status: { type: String, default: 'Active', index: true }
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
