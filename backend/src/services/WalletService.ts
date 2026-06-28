import { TransactionRepository } from '../repositories/TransactionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BadRequestError, NotFoundError } from '../core/errors';
import mongoose from 'mongoose';

export class WalletService {
  private transRepo = new TransactionRepository();
  private userRepo = new UserRepository();

  async deposit(userId: string, amount: number, description: string = 'Quick Deposit'): Promise<number> {
    if (amount <= 0) {
      throw new BadRequestError('Deposit amount must be positive.');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    await this.transRepo.create({
      userId: user._id,
      amount,
      type: 'Deposit',
      status: 'Completed',
      description,
      reference: `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return user.walletBalance;
  }

  async getTransactions(userId: string): Promise<any[]> {
    return this.transRepo.findByUserId(userId);
  }
}
export const walletService = new WalletService();
export default walletService;
