import mongoose, { Document, Schema, Model } from 'mongoose';

export type QuestionType = 'Single Choice' | 'Multiple Choice' | 'True False' | 'Image Questions' | 'Video Questions' | 'Audio Questions';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
  mediaUrl?: string;
}

export interface IQuestion extends Document {
  poolId: mongoose.Types.ObjectId;
  category: string;
  type: QuestionType;
  text: string;
  mediaUrl: string;
  options: IQuestionOption[];
  marks: number;
  negativeMarks: number;
  difficulty: QuestionDifficulty;
  explanation: string;
  questionTimer: number; // in seconds, 0 for none
  createdAt: Date;
  updatedAt: Date;
}

const questionOptionSchema = new Schema<IQuestionOption>({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  mediaUrl: { type: String, default: '' }
}, { _id: false });

const questionSchema = new Schema<IQuestion>(
  {
    poolId: { type: Schema.Types.ObjectId, ref: 'QuestionPool', required: true, index: true },
    category: { type: String, default: '', index: true },
    type: {
      type: String,
      enum: ['Single Choice', 'Multiple Choice', 'True False', 'Image Questions', 'Video Questions', 'Audio Questions'],
      required: true,
      index: true
    },
    text: { type: String, required: true, trim: true },
    mediaUrl: { type: String, default: '' },
    options: [questionOptionSchema],
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true
    },
    explanation: { type: String, default: '' },
    questionTimer: { type: Number, default: 0 } // individual question countdown timer (in seconds)
  },
  {
    timestamps: true
  }
);

export const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);
export default Question;
