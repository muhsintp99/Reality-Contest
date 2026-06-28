import { BaseRepository } from './BaseRepository';
import { IUser, User } from '../models/User';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.findOne({ username: username.toLowerCase() });
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return this.findOne({ phone });
  }

  async findByEmailOrPhone(loginId: string): Promise<IUser | null> {
    const queryId = loginId.trim();
    return this.findOne({
      $or: [
        { email: queryId.toLowerCase() },
        { phone: queryId }
      ]
    });
  }

  async findWithPagination(filter: any, skip: number, limit: number): Promise<IUser[]> {
    return this.model.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }
}
export default UserRepository;
