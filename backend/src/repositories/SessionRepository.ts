import { BaseRepository } from './BaseRepository';
import { ISession, Session } from '../models/Session';

export class SessionRepository extends BaseRepository<ISession> {
  constructor() {
    super(Session);
  }

  async findByToken(token: string): Promise<ISession | null> {
    return this.findOne({ token });
  }

  async findByUserId(userId: string): Promise<ISession[]> {
    return this.find({ userId });
  }

  async deleteOtherSessions(userId: string, currentToken: string): Promise<any> {
    return this.deleteMany({
      userId,
      token: { $ne: currentToken }
    });
  }

  async deleteAllSessions(userId: string): Promise<any> {
    return this.deleteMany({ userId });
  }
}
export default SessionRepository;
