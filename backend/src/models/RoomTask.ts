import mongoose, { Schema, Document } from 'mongoose';

export type TaskType =
  | 'Quiz'
  | 'Image Upload'
  | 'Video Upload'
  | 'Document Upload'
  | 'Creative Writing'
  | 'AI Prompt'
  | 'Survey'
  | 'Puzzle'
  | 'Logic Challenge'
  | 'Daily Activity';

export interface IRoomTask extends Document {
  title: string;
  description: string;
  instructions?: string;
  cycleId: mongoose.Types.ObjectId;
  targetRooms: mongoose.Types.ObjectId[]; // Empty array means All Rooms
  taskType: TaskType;
  points: number;
  bonusPoints: number;
  penalty: number;
  deadline: Date;
  reviewType: 'Auto' | 'Manual';
  visibility: 'Public' | 'Room-Only';
  status: 'Draft' | 'Active' | 'Closed';
  allowDuplicateSubmission: boolean;
  fileLimits: {
    maxSizeMB: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  quizData?: {
    questions: Array<{
      questionText: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
  };
  surveyQuestions?: string[];
  createdDate: Date;
  updatedAt: Date;
}

const RoomTaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    instructions: { type: String, default: '' },
    cycleId: { type: Schema.Types.ObjectId, ref: 'Cycle', required: true, index: true },
    targetRooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
    taskType: {
      type: String,
      enum: [
        'Quiz',
        'Image Upload',
        'Video Upload',
        'Document Upload',
        'Creative Writing',
        'AI Prompt',
        'Survey',
        'Puzzle',
        'Logic Challenge',
        'Daily Activity'
      ],
      required: true,
      index: true
    },
    points: { type: Number, required: true, min: 0 },
    bonusPoints: { type: Number, default: 0, min: 0 },
    penalty: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: true },
    reviewType: { type: String, enum: ['Auto', 'Manual'], default: 'Manual' },
    visibility: { type: String, enum: ['Public', 'Room-Only'], default: 'Public' },
    status: { type: String, enum: ['Draft', 'Active', 'Closed'], default: 'Active', index: true },
    allowDuplicateSubmission: { type: Boolean, default: false },
    fileLimits: {
      maxSizeMB: { type: Number, default: 10 },
      allowedTypes: [{ type: String }],
      maxFiles: { type: Number, default: 1 }
    },
    quizData: {
      questions: [
        {
          questionText: { type: String },
          options: [{ type: String }],
          correctAnswer: { type: Number },
          explanation: { type: String }
        }
      ]
    },
    surveyQuestions: [{ type: String }],
    createdDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

RoomTaskSchema.index({ cycleId: 1, status: 1 });

export default mongoose.model<IRoomTask>('RoomTask', RoomTaskSchema);
