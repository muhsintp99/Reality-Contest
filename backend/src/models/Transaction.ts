import mongoose, { Document, Schema, Model } from 'mongoose';

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Entry Fee' | 'Prize Payout' | 'Credit' | 'Debit' | 'Reward' | 'Refund' | 'Bonus';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Rejected';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency?: 'INR' | 'Coins';
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['INR', 'Coins'], default: 'INR' },
    type: {
      type: String,
      enum: ['Deposit', 'Withdrawal', 'Entry Fee', 'Prize Payout', 'Credit', 'Debit', 'Reward', 'Refund', 'Bonus'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Rejected'],
      default: 'Pending',
      index: true
    },
    description: { type: String, default: '' },
    reference: { type: String, unique: true, sparse: true }
  },
  {
    timestamps: true
  }
);

export const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
