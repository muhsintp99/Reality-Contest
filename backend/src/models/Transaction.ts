import mongoose, { Document, Schema, Model } from 'mongoose';

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Entry Fee' | 'Prize Payout';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
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
    type: {
      type: String,
      enum: ['Deposit', 'Withdrawal', 'Entry Fee', 'Prize Payout'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
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
