import { BaseRepository } from './BaseRepository';
import { ITransaction, Transaction } from '../models/Transaction';

export class TransactionRepository extends BaseRepository<ITransaction> {
  constructor() {
    super(Transaction);
  }

  async findByUserId(userId: string): Promise<ITransaction[]> {
    return this.find({ userId }, null, { sort: { createdAt: -1 } });
  }
}
export default TransactionRepository;
