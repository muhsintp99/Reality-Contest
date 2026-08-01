import mongoose, { Schema, Document } from 'mongoose';

export interface ISurveyOption {
  optionId: string;
  text: string;
  count?: number;
}

export interface ISurveyQuestion {
  questionId: string;
  title: string;
  type: 'Single Choice' | 'Multiple Choice' | 'Rating' | 'Text';
  options?: ISurveyOption[];
  required?: boolean;
}

export interface ISurveyTarget {
  userGroup: string; // 'All Registered Users' | 'Active Contestants' | 'KYC Verified' | 'New Users'
  minContests?: number;
}

export interface ISurveyReward {
  type: string; // 'Coins' | 'Free Contest Ticket' | 'Cash Bonus'
  value: string; // e.g. '50 Bonus Coins', '1 Ticket'
}

export interface ISurveySchedule {
  startDate: string;
  endDate: string;
}

export interface ISurvey extends Document {
  surveyId: string;
  title: string;
  description?: string;
  questions: ISurveyQuestion[];
  targetGroup: string;
  reward: string;
  schedule: string;
  startDate?: string;
  endDate?: string;
  responses: number;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SurveyOptionSchema: Schema = new Schema(
  {
    optionId: { type: String, required: true },
    text: { type: String, required: true },
    count: { type: Number, default: 0 }
  },
  { _id: false }
);

const SurveyQuestionSchema: Schema = new Schema(
  {
    questionId: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['Single Choice', 'Multiple Choice', 'Rating', 'Text'],
      default: 'Single Choice'
    },
    options: [SurveyOptionSchema],
    required: { type: Boolean, default: true }
  },
  { _id: false }
);

const SurveySchema: Schema = new Schema(
  {
    surveyId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: [SurveyQuestionSchema],
    targetGroup: { type: String, default: 'All Registered Users', index: true },
    reward: { type: String, default: '50 Bonus Coins' },
    schedule: { type: String, default: '27 Jul - 31 Aug' },
    startDate: { type: String },
    endDate: { type: String },
    responses: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true }
  },
  { timestamps: true }
);

export const Survey = mongoose.models.Survey || mongoose.model<ISurvey>('Survey', SurveySchema);
export default Survey;
