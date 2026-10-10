import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/WalletService';

export class WalletController {
  /**
   * Get full contestant wallet overview: balance, coins, stats, recent transactions
   */
  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const walletData = await walletService.getWallet(userId);
      res.status(200).json({ success: true, data: walletData });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Top up / deposit funds into contestant wallet
   */
  async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const { amount, description, paymentRef } = req.body;
      const result = await walletService.deposit(userId, parseFloat(amount), description, paymentRef);
      res.status(200).json({
        success: true,
        message: `₹${amount} deposited successfully to your wallet.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Request withdrawal from contestant wallet
   */
  async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const { amount, method, upiId, accountNumber, ifsc } = req.body;
      const result = await walletService.withdraw(userId, parseFloat(amount), { method, upiId, accountNumber, ifsc });
      res.status(200).json({
        success: true,
        message: `Withdrawal request of ₹${amount} submitted successfully.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Pay contest or stage entry fee from wallet or coins
   */
  async payEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const { amount, contestTitle, currency } = req.body;
      const result = await walletService.payEntryFee(userId, parseFloat(amount), contestTitle || 'Contest Entry', currency || 'INR');
      res.status(200).json({
        success: true,
        message: 'Entry fee paid successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Claim daily login reward coins
   */
  async claimDailyBonus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const result = await walletService.claimDailyBonus(userId);
      res.status(200).json({
        success: true,
        message: `+${result.coinsAdded} Daily Bonus Coins claimed! 🪙`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get contestant wallet transactions history
   */
  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const result = await walletService.getTransactions(userId, req.query);
      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit) || 1
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const walletController = new WalletController();
export default walletController;
