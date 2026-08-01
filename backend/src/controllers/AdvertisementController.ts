import { Request, Response, NextFunction } from 'express';
import { Advertisement } from '../models/Advertisement';
import { NotFoundError, BadRequestError } from '../core/errors';

export class AdvertisementController {
  // GET /api/admin/ads or /api/ads (Public & Admin list)
  async listAds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, status, search } = req.query;
      const query: any = {};

      if (type && type !== 'all' && type !== 'create') {
        query.type = type;
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search as string, $options: 'i' } },
          { sponsorName: { $regex: search as string, $options: 'i' } },
          { placement: { $regex: search as string, $options: 'i' } }
        ];
      }

      const ads = await Advertisement.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: ads.length, ads });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/ads/:id
  async getAdById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ad = await Advertisement.findById(id);
      if (!ad) throw new NotFoundError('Advertisement campaign not found.');
      res.status(200).json({ success: true, ad });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/admin/ads
  async createAd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adData = req.body;
      if (!adData.title) {
        throw new BadRequestError('Advertisement campaign title is required.');
      }
      const ad = await Advertisement.create(adData);
      res.status(201).json({ success: true, message: 'Ad campaign created successfully.', ad });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/admin/ads/:id
  async updateAd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ad = await Advertisement.findByIdAndUpdate(id, req.body, { new: true });
      if (!ad) throw new NotFoundError('Advertisement campaign not found.');
      res.status(200).json({ success: true, message: 'Ad campaign updated successfully.', ad });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/admin/ads/:id
  async deleteAd(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ad = await Advertisement.findByIdAndDelete(id);
      if (!ad) throw new NotFoundError('Advertisement campaign not found.');
      res.status(200).json({ success: true, message: 'Ad campaign deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/admin/ads/:id/status
  async toggleAdStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ad = await Advertisement.findById(id);
      if (!ad) throw new NotFoundError('Advertisement campaign not found.');

      const nextStatus = ad.status === 'Active' ? 'Paused' : 'Active';
      ad.status = nextStatus;
      await ad.save();

      res.status(200).json({ success: true, message: `Ad campaign status updated to ${nextStatus}.`, status: nextStatus, ad });
    } catch (err) {
      next(err);
    }
  }
}

export const advertisementController = new AdvertisementController();
export default advertisementController;
