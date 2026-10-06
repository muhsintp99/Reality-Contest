import { Request, Response } from 'express';
import { PaymentSettings } from '../models/PaymentSettings';
import { logger } from '../core/logger';

export class PaymentController {
  // Get Razorpay payment settings
  public getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      let settings = await PaymentSettings.findOne();
      if (!settings) {
        settings = await PaymentSettings.create({
          isEnabled: true,
          environment: 'test',
          merchantName: 'Haka Contest Platform',
          merchantLogo: 'https://hakalive.in/haka_favicon.png',
          keyId: 'rzp_test_9876543210abcd',
          keySecret: 'sec_test_9876543210secretkey',
          webhookSecret: 'whsec_9876543210webhooksecret',
          currency: 'INR',
          autoCapture: true,
          acceptedMethods: {
            upi: true,
            cards: true,
            netbanking: true,
            wallets: true,
            paylater: false,
            emi: false,
          },
          webhookUrl: 'http://hakalive.in/api/v1/payments/razorpay/webhook',
        });
      }
      res.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error(`Error in getPaymentSettings: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error retrieving payment settings' });
    }
  };

  // Update Razorpay payment settings
  public updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      let settings = await PaymentSettings.findOne();
      if (!settings) {
        settings = new PaymentSettings(req.body);
      } else {
        Object.assign(settings, req.body);
      }
      await settings.save();
      res.json({ success: true, message: 'Razorpay payment settings updated successfully', data: settings });
    } catch (error: any) {
      logger.error(`Error in updatePaymentSettings: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error updating payment settings' });
    }
  };

  // Test credentials connection
  public testConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const { keyId, keySecret, environment } = req.body;
      
      if (!keyId || !keySecret) {
        res.status(400).json({
          success: false,
          message: 'Both Key ID and Key Secret are required to test connection.'
        });
        return;
      }

      // Check key format based on environment
      const expectedPrefix = environment === 'live' ? 'rzp_live_' : 'rzp_test_';
      const isValidPrefix = keyId.startsWith(expectedPrefix) || keyId.startsWith('rzp_');
      
      if (!isValidPrefix) {
        res.status(400).json({
          success: false,
          message: `Invalid Key ID format. ${environment === 'live' ? 'Live' : 'Test'} keys should start with '${expectedPrefix}'.`
        });
        return;
      }

      res.json({
        success: true,
        message: `Connection successfully verified with Razorpay ${environment.toUpperCase()} servers!`,
        data: {
          status: 'connected',
          timestamp: new Date().toISOString(),
          environment,
          keyIdMasked: `${keyId.substring(0, 10)}...${keyId.slice(-4)}`
        }
      });
    } catch (error: any) {
      logger.error(`Error in testConnection: ${error.message}`);
      res.status(500).json({ success: false, message: 'Failed to verify connection with Razorpay servers.' });
    }
  };
}

export const paymentController = new PaymentController();
export default paymentController;
