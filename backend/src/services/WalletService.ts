import { TransactionRepository } from '../repositories/TransactionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { BadRequestError, NotFoundError, ForbiddenError } from '../core/errors';
import mongoose from 'mongoose';

export class WalletService {
  private transRepo = new TransactionRepository();
  private userRepo = new UserRepository();

  /**
   * Retrieves user wallet balance, coin points, KYC status, and recent activity.
   */
  async getWallet(userId: string) {
    const user = await User.findById(userId).select('name email phone walletBalance coins kycStatus referralCode avatar');
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const stats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'Completed' } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalDeposited = 0;
    let totalWon = 0;
    let totalSpent = 0;
    let totalWithdrawn = 0;

    for (const st of stats) {
      if (st._id === 'Deposit' || st._id === 'Credit') totalDeposited += st.totalAmount;
      else if (st._id === 'Prize Payout' || st._id === 'Reward' || st._id === 'Bonus') totalWon += st.totalAmount;
      else if (st._id === 'Entry Fee' || st._id === 'Debit') totalSpent += st.totalAmount;
      else if (st._id === 'Withdrawal') totalWithdrawn += st.totalAmount;
    }

    return {
      walletBalance: user.walletBalance || 0,
      coins: user.coins || 0,
      kycStatus: user.kycStatus || 'Pending',
      isKycVerified: user.kycStatus === 'Approved',
      isEligibleForWithdrawal: user.kycStatus === 'Approved' && (user.walletBalance || 0) >= 100,
      currency: 'INR',
      coinSymbol: '🪙',
      summary: {
        totalDeposited,
        totalWon,
        totalSpent,
        totalWithdrawn
      },
      recentTransactions: transactions
    };
  }

  /**
   * Deposits funds into the contestant's wallet.
   */
  async deposit(userId: string, amount: number, description: string = 'Wallet Topup', paymentRef?: string): Promise<{ newBalance: number; transaction: any }> {
    if (amount <= 0) {
      throw new BadRequestError('Deposit amount must be positive.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    const reference = paymentRef || `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await Transaction.create({
      userId: user._id,
      amount,
      currency: 'INR',
      type: 'Deposit',
      status: 'Completed',
      description,
      reference
    });

    return {
      newBalance: user.walletBalance,
      transaction
    };
  }

  /**
   * Request withdrawal from contestant wallet to Bank / UPI.
   */
  async withdraw(userId: string, amount: number, payoutDetails?: { method?: string; upiId?: string; accountNumber?: string; ifsc?: string }): Promise<{ newBalance: number; transaction: any }> {
    if (amount < 100) {
      throw new BadRequestError('Minimum withdrawal amount is ₹100.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (user.kycStatus !== 'Approved') {
      throw new ForbiddenError('KYC verification is required before initiating withdrawals. Please complete KYC under Profile.');
    }

    if ((user.walletBalance || 0) < amount) {
      throw new BadRequestError(`Insufficient wallet balance. Current balance is ₹${user.walletBalance || 0}.`);
    }

    user.walletBalance = (user.walletBalance || 0) - amount;
    await user.save();

    const payoutDesc = payoutDetails?.upiId
      ? `Payout to UPI: ${payoutDetails.upiId}`
      : payoutDetails?.accountNumber
      ? `Payout to Bank A/C: ****${payoutDetails.accountNumber.slice(-4)}`
      : 'Bank / UPI Withdrawal Request';

    const transaction = await Transaction.create({
      userId: user._id,
      amount,
      currency: 'INR',
      type: 'Withdrawal',
      status: 'Pending',
      description: payoutDesc,
      reference: `WTH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return {
      newBalance: user.walletBalance,
      transaction
    };
  }

  /**
   * Deducts contest entry fee from wallet or platform coins.
   */
  async payEntryFee(userId: string, amount: number, contestTitle: string, currency: string = 'INR'): Promise<{ newBalance: number; transaction: any }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isCoin = typeof currency === 'string' && currency.trim().toLowerCase().startsWith('coin');
    const selectedCurrency: 'INR' | 'Coins' = isCoin ? 'Coins' : 'INR';

    if (selectedCurrency === 'Coins') {
      if ((user.coins || 0) < amount) {
        throw new BadRequestError(`Insufficient coins. You have ${user.coins || 0} coins, but contest requires ${amount} coins.`);
      }
      user.coins = (user.coins || 0) - amount;
    } else {
      if ((user.walletBalance || 0) < amount) {
        throw new BadRequestError(`Insufficient wallet balance. You have ₹${user.walletBalance || 0}, but entry fee is ₹${amount}.`);
      }
      user.walletBalance = (user.walletBalance || 0) - amount;
    }

    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      amount,
      currency: selectedCurrency,
      type: 'Entry Fee',
      status: 'Completed',
      description: `Entry Fee for: ${contestTitle} (${selectedCurrency === 'Coins' ? `${amount} Coins` : `₹${amount}`})`,
      reference: `ENT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return {
      newBalance: selectedCurrency === 'Coins' ? user.coins : user.walletBalance,
      transaction
    };
  }

  /**
   * Adds prize payout or reward to contestant wallet.
   */
  async addReward(userId: string, amount: number, title: string, currency: string = 'INR'): Promise<{ newBalance: number; transaction: any }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isCoin = typeof currency === 'string' && currency.trim().toLowerCase().startsWith('coin');
    const selectedCurrency: 'INR' | 'Coins' = isCoin ? 'Coins' : 'INR';

    if (selectedCurrency === 'Coins') {
      user.coins = (user.coins || 0) + amount;
    } else {
      user.walletBalance = (user.walletBalance || 0) + amount;
    }

    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      amount,
      currency: selectedCurrency,
      type: 'Prize Payout',
      status: 'Completed',
      description: `Reward Won: ${title}`,
      reference: `RWD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return {
      newBalance: selectedCurrency === 'Coins' ? user.coins : user.walletBalance,
      transaction
    };
  }

  /**
   * Claim daily login bonus coins / wallet credit.
   */
  async claimDailyBonus(userId: string): Promise<{ coinsAdded: number; newCoins: number }> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const bonusCoins = 50;
    user.coins = (user.coins || 0) + bonusCoins;
    await user.save();

    await Transaction.create({
      userId: user._id,
      amount: bonusCoins,
      currency: 'Coins',
      type: 'Bonus',
      status: 'Completed',
      description: 'Daily Check-in Bonus Coins 🪙',
      reference: `DLY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return {
      coinsAdded: bonusCoins,
      newCoins: user.coins
    };
  }

  /**
   * Converts contestant coins into wallet cash balance.
   * Standard conversion: 10 Coins = 1 INR (e.g. 500 Coins = 50 INR).
   */
  async convertCoinsToCash(userId: string, coinsAmount: number): Promise<{ coinsConverted: number; cashAdded: number; newCoins: number; newWalletBalance: number }> {
    if (isNaN(coinsAmount) || coinsAmount <= 0) {
      throw new BadRequestError('Coins amount must be greater than 0.');
    }

    if (coinsAmount < 50) {
      throw new BadRequestError('Minimum conversion threshold is 50 Coins (₹5 INR).');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if ((user.coins || 0) < coinsAmount) {
      throw new BadRequestError(`Insufficient coins. You have ${user.coins || 0} coins, but requested to convert ${coinsAmount} coins.`);
    }

    const conversionRate = 10; // 10 Coins = 1 INR
    const cashAmount = parseFloat((coinsAmount / conversionRate).toFixed(2));

    user.coins = (user.coins || 0) - coinsAmount;
    user.walletBalance = (user.walletBalance || 0) + cashAmount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      amount: cashAmount,
      currency: 'INR',
      type: 'Credit',
      status: 'Completed',
      description: `Converted ${coinsAmount} Coins to ₹${cashAmount} Wallet Cash 🪙->₹`,
      reference: `CNV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    return {
      coinsConverted: coinsAmount,
      cashAdded: cashAmount,
      newCoins: user.coins,
      newWalletBalance: user.walletBalance
    };
  }

  /**
   * Retrieves transaction list with optional filter and pagination.
   */
  async getTransactions(userId: string, query: any = {}): Promise<{ transactions: any[]; total: number; page: number; limit: number }> {
    const { type, page = 1, limit = 20 } = query;
    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (type && type !== 'All') {
      filter.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(filter);

    return {
      transactions,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }
}

export const walletService = new WalletService();
export default walletService;
