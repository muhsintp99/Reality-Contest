import mongoose, { Schema, Document } from 'mongoose';

export interface ICycle extends Document {
  cycleNumber: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Archived';
  autoStart: boolean;
  autoEnd: boolean;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  createdDate: Date;
  updatedAt: Date;
}

const CycleSchema: Schema = new Schema(
  {
    cycleNumber: { type: Number, required: true, unique: true, min: 1, max: 10, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Upcoming', 'Active', 'Completed', 'Archived'], default: 'Upcoming', index: true },
    autoStart: { type: Boolean, default: true },
    autoEnd: { type: Boolean, default: true },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

CycleSchema.index({ status: 1, cycleNumber: 1 });

export default mongoose.model<ICycle>('Cycle', CycleSchema);
