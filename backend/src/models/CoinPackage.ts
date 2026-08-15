import mongoose, { Schema, Document } from 'mongoose';

export interface ICoinPackage extends Document {
  name: string;
  coins: number;
  bonusCoins: number;
  price: number;
  tag?: string;
  active: boolean;
}

const CoinPackageSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    coins: { type: Number, required: true },
    bonusCoins: { type: Number, default: 0 },
    price: { type: Number, required: true },
    tag: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CoinPackage = mongoose.model<ICoinPackage>('CoinPackage', CoinPackageSchema);
export default CoinPackage;
