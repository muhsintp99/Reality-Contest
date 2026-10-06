import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
  isEnabled: boolean;
  environment: 'test' | 'live';
  merchantName: string;
  merchantLogo: string;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  currency: string;
  autoCapture: boolean;
  acceptedMethods: {
    upi: boolean;
    cards: boolean;
    netbanking: boolean;
    wallets: boolean;
    paylater: boolean;
    emi: boolean;
  };
  webhookUrl: string;
}

const PaymentSettingsSchema: Schema = new Schema(
  {
    isEnabled: { type: Boolean, default: true },
    environment: { type: String, enum: ['test', 'live'], default: 'test' },
    merchantName: { type: String, default: 'Haka Contest Platform' },
    merchantLogo: { type: String, default: 'https://hakalive.in/haka_favicon.png' },
    keyId: { type: String, default: 'rzp_test_9876543210abcd' },
    keySecret: { type: String, default: 'sec_test_9876543210secretkey' },
    webhookSecret: { type: String, default: 'whsec_9876543210webhooksecret' },
    currency: { type: String, default: 'INR' },
    autoCapture: { type: Boolean, default: true },
    acceptedMethods: {
      upi: { type: Boolean, default: true },
      cards: { type: Boolean, default: true },
      netbanking: { type: Boolean, default: true },
      wallets: { type: Boolean, default: true },
      paylater: { type: Boolean, default: false },
      emi: { type: Boolean, default: false },
    },
    webhookUrl: { type: String, default: 'http://hakalive.in/api/v1/payments/razorpay/webhook' },
  },
  { timestamps: true }
);

export const PaymentSettings = mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);
export default PaymentSettings;
