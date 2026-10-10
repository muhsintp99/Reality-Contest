import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId; // Optional in case system event
  action: string;
  ipAddress?: string;
  deviceInfo?: string;
  browser?: string;
  details: string;
  contestId?: string;
  targetId?: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
  module?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    browser: { type: String },
    details: { type: String, default: '' },
    contestId: { type: String, index: true },
    targetId: { type: String },
    severity: { type: String, enum: ['info', 'warning', 'critical', 'success'], default: 'info' },
    module: { type: String, default: 'Platform', index: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
