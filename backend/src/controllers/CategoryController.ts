import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/CategoryService';

export class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, category });
    } catch (err) {
      next(err);
    }
  }

  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.listCategories(req.query);
      res.status(200).json({ success: true, categories });
    } catch (err) {
      next(err);
    }
  }

  async getCategoryDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({ success: true, category });
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({ success: true, category });
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.deleteCategory(req.params.id);
      res.status(200).json({ success: true, category });
    } catch (err) {
      next(err);
    }
  }
}

export const categoryController = new CategoryController();
export default categoryController;
