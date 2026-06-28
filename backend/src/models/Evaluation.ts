import mongoose, { Document, Schema, Model } from 'mongoose';

export type EvaluationType = 'Automatic' | 'Manual' | 'Judge' | 'AI' | 'Audience';

export interface IEvaluation extends Document {
  attemptId: mongoose.Types.ObjectId;
  stageId: mongoose.Types.ObjectId;
  judgeId?: mongoose.Types.ObjectId; // Empty if EvaluationType is Automatic / AI
  score: number;
  metrics: Record<string, number>; // e.g. creativity: 8, presentation: 7
  remarks: string;
  evaluationType: EvaluationType;
  createdAt: Date;
  updatedAt: Date;
}

const evaluationSchema = new Schema<IEvaluation>(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true, index: true },
    stageId: { type: Schema.Types.ObjectId, ref: 'Stage', required: true, index: true },
    judgeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    score: { type: Number, required: true },
    metrics: { type: Schema.Types.Mixed, default: {} },
    remarks: { type: String, default: '' },
    evaluationType: {
      type: String,
      enum: ['Automatic', 'Manual', 'Judge', 'AI', 'Audience'],
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Evaluation: Model<IEvaluation> = mongoose.models.Evaluation || mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
export default Evaluation;
