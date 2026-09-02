import mongoose, { Schema, Document } from 'mongoose';

export type TaskType =
  | 'Quiz'
  | 'Creative'
  | 'Photo'
  | 'Video'
  | 'Document'
  | 'AI Prompt'
  | 'Puzzle'
  | 'Logic'
  | 'Survey';

export type SubmissionType =
  | 'Text'
  | 'Image'
  | 'Video'
  | 'PDF'
  | 'Document'
  | 'URL'
  | 'ZIP';

export type ReviewType = 'Manual' | 'AI' | 'Auto';

export type TaskStatus = 'Draft' | 'Published' | 'Running' | 'Completed' | 'Archived';

export interface ITask extends Document {
  title: string;
  description: string;
  instructions?: string;
  mediaUrl?: string;
  taskType: TaskType;
  submissionType: SubmissionType;
  points: number;
  bonusPoints: number;
  penaltyPoints: number;
  maxAttempts: number;
  reviewType: ReviewType;
  status: TaskStatus;
  isMandatory: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    instructions: {
      type: String
    },
    mediaUrl: {
      type: String,
      default: ''
    },
    taskType: {
      type: String,
      enum: [
        'Quiz',
        'Creative',
        'Photo',
        'Video',
        'Document',
        'AI Prompt',
        'Puzzle',
        'Logic',
        'Survey'
      ],
      required: true
    },
    submissionType: {
      type: String,
      enum: [
        'Text',
        'Image',
        'Video',
        'PDF',
        'Document',
        'URL',
        'ZIP'
      ],
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    bonusPoints: {
      type: Number,
      default: 0
    },
    penaltyPoints: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 1
    },
    reviewType: {
      type: String,
      enum: ['Manual', 'AI', 'Auto'],
      default: 'Manual'
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Published',
        'Running',
        'Completed',
        'Archived'
      ],
      default: 'Draft'
    },
    isMandatory: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
export default Task;
