import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/WalletService';

export class WalletController {
  async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { amount, description } = req.body;
      const newBalance = await walletService.deposit(userId, parseFloat(amount), description);
      res.status(200).json({ success: true, message: 'Deposit successful.', walletBalance: newBalance });
    } catch (err) {
      next(err);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const transactions = await walletService.getTransactions(userId);
      res.status(200).json({ success: true, transactions });
    } catch (err) {
      next(err);
    }
  }
}
export const walletController = new WalletController();
export default walletController;
