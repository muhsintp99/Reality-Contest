import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';
import { NotFoundError, BadRequestError } from '../core/errors';

export class CouponController {
  // GET /api/admin/coupons (Admin list)
  async listCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, status, search } = req.query;
      const query: any = {};

      if (type && type !== 'all') {
        query.type = type;
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { code: { $regex: search as string, $options: 'i' } },
          { description: { $regex: search as string, $options: 'i' } }
        ];
      }

      const coupons = await Coupon.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: coupons.length, coupons });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/coupons/:id
  async getCouponById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      if (!coupon) throw new NotFoundError('Coupon not found.');
      res.status(200).json({ success: true, coupon });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/coupons
  async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponData = req.body;
      if (!couponData.code) {
        throw new BadRequestError('Coupon promo code is required.');
      }
      const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
      if (existing) {
        throw new BadRequestError('Coupon promo code already exists.');
      }
      const coupon = await Coupon.create({
        ...couponData,
        code: couponData.code.toUpperCase()
      });
      res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/coupons/:id
  async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (req.body.code) {
        req.body.code = req.body.code.toUpperCase();
      }
      const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
      if (!coupon) throw new NotFoundError('Coupon not found.');
      res.status(200).json({ success: true, message: 'Coupon updated successfully.', coupon });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/coupons/:id
  async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) throw new NotFoundError('Coupon not found.');
      res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/coupons/:id/status
  async toggleCouponStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      if (!coupon) throw new NotFoundError('Coupon not found.');

      const nextStatus = coupon.status === 'Active' ? 'Disabled' : 'Active';
      coupon.status = nextStatus;
      await coupon.save();

      res.status(200).json({ success: true, message: `Coupon status updated to ${nextStatus}.`, status: nextStatus, coupon });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/coupons/validate (Public user app redemption API)
  async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, contestFee } = req.body;
      if (!code) throw new BadRequestError('Please provide coupon code.');

      const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'Active' });
      if (!coupon) throw new NotFoundError('Invalid or expired promo code.');

      if (contestFee && coupon.minContestFee > contestFee) {
        throw new BadRequestError(`Minimum contest entry fee of ₹${coupon.minContestFee} required for this coupon.`);
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = ((contestFee || 100) * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'flat') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'free_pass') {
        discountAmount = contestFee || 100;
      }

      res.status(200).json({
        success: true,
        message: 'Coupon code applied successfully.',
        code: coupon.code,
        discountAmount,
        type: coupon.type,
        discountType: coupon.discountType
      });
    } catch (err) {
      next(err);
    }
  }
}

export const couponController = new CouponController();
export default couponController;
