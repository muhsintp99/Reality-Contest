import { Request, Response } from 'express';
import { CoinSettings } from '../models/CoinSettings';
import { CoinPackage } from '../models/CoinPackage';
import { Transaction } from '../models/Transaction';
import { logger } from '../core/logger';

export class CoinController {
  // 1. Get Coin Settings
  public getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      let settings = await CoinSettings.findOne();
      if (!settings) {
        settings = await CoinSettings.create({
          coinRate: 10,
          minRedeemCoins: 100,
          maxDailyEarnLimit: 500,
          signupBonus: 50,
          dailyLoginBonus: 10,
          referralSenderBonus: 25,
          referralReceiverBonus: 25,
          videoAdBonus: 5,
          surveyBonus: 20,
        });
      }
      res.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error(`Error in getSettings: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error retrieving coin settings' });
    }
  };

  // 2. Update Coin Settings
  public updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      let settings = await CoinSettings.findOne();
      if (!settings) {
        settings = new CoinSettings(req.body);
      } else {
        Object.assign(settings, req.body);
      }
      await settings.save();
      res.json({ success: true, message: 'Coin settings updated successfully', data: settings });
    } catch (error: any) {
      logger.error(`Error in updateSettings: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error updating coin settings' });
    }
  };

  // 3. List Coin Packages
  public listPackages = async (req: Request, res: Response): Promise<void> => {
    try {
      const packages = await CoinPackage.find().sort({ price: 1 });
      res.json({ success: true, data: packages });
    } catch (error: any) {
      logger.error(`Error in listPackages: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error retrieving coin packages' });
    }
  };

  // 4. Create Package
  public createPackage = async (req: Request, res: Response): Promise<void> => {
    try {
      const pkg = await CoinPackage.create(req.body);
      res.status(201).json({ success: true, message: 'Coin package created successfully', data: pkg });
    } catch (error: any) {
      logger.error(`Error in createPackage: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error creating coin package' });
    }
  };

  // 5. Update Package
  public updatePackage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const pkg = await CoinPackage.findByIdAndUpdate(id, req.body, { new: true });
      if (!pkg) {
        res.status(404).json({ success: false, message: 'Coin package not found' });
        return;
      }
      res.json({ success: true, message: 'Coin package updated successfully', data: pkg });
    } catch (error: any) {
      logger.error(`Error in updatePackage: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error updating coin package' });
    }
  };

  // 6. Delete Package
  public deletePackage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await CoinPackage.findByIdAndDelete(id);
      res.json({ success: true, message: 'Coin package deleted successfully' });
    } catch (error: any) {
      logger.error(`Error in deletePackage: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error deleting coin package' });
    }
  };

  // 7. List Transactions Log
  public listTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const txns = await Transaction.find().sort({ createdAt: -1 }).limit(50);
      res.json({ success: true, data: txns });
    } catch (error: any) {
      logger.error(`Error in listTransactions: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error retrieving coin transactions' });
    }
  };
}

export const coinController = new CoinController();
export default coinController;
