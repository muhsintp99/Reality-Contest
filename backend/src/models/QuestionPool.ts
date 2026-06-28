import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IQuestionPool extends Document {
  name: string;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionPoolSchema = new Schema<IQuestionPool>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export const QuestionPool: Model<IQuestionPool> = mongoose.models.QuestionPool || mongoose.model<IQuestionPool>('QuestionPool', questionPoolSchema);
export default QuestionPool;
