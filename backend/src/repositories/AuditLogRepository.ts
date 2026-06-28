import { BaseRepository } from './BaseRepository';
import { IAuditLog, AuditLog } from '../models/AuditLog';

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }

  async findRecentLogs(limit: number = 100): Promise<IAuditLog[]> {
    return this.find({}, null, { sort: { createdAt: -1 }, limit });
  }
}
export default AuditLogRepository;
