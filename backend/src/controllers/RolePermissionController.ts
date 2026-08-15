import { Request, Response, NextFunction } from 'express';
import { RolePermission } from '../models/RolePermission';
import { logger } from '../core/logger';

export class RolePermissionController {
  // 1. Get all role permissions matrix
  public getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const records = await RolePermission.find();
      const matrix: Record<string, Record<string, { view: boolean; edit: boolean; delete: boolean; export: boolean }>> = {};

      records.forEach((rec) => {
        matrix[rec.role] = {};
        rec.permissions.forEach((p) => {
          matrix[rec.role][p.module] = {
            view: p.view,
            edit: p.edit,
            delete: p.delete,
            export: p.export
          };
        });
      });

      res.status(200).json({ success: true, data: matrix, roles: Object.keys(matrix) });
    } catch (err) {
      next(err);
    }
  };

  // 2. Save matrix for a specific role
  public savePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, permissions } = req.body;
      if (!role || !permissions) {
        res.status(400).json({ success: false, message: 'Role and permissions object are required.' });
        return;
      }

      // Format permissions array
      const permArray = Object.keys(permissions).map((mod) => ({
        module: mod,
        view: !!permissions[mod].view,
        edit: !!permissions[mod].edit,
        delete: !!permissions[mod].delete,
        export: !!permissions[mod].export
      }));

      await RolePermission.findOneAndUpdate(
        { role },
        { role, permissions: permArray },
        { upsert: true, new: true }
      );

      res.status(200).json({ success: true, message: `Permission matrix for role "${role}" saved successfully.` });
    } catch (err) {
      next(err);
    }
  };

  // 3. Create Custom Role
  public createCustomRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ success: false, message: 'Role title is required.' });
        return;
      }

      const existing = await RolePermission.findOne({ role });
      if (existing) {
        res.status(400).json({ success: false, message: 'Role already exists.' });
        return;
      }

      const defaultPerms = [
        'Dashboard', 'User Management', 'Contest Management', 'Daily Contest Desk',
        'Category Management', 'Grand Contest', 'Question Bank', 'Survey Management',
        'Task Management', 'Challenge Management', 'Leaderboard', 'Wallet Management',
        'Coin Management', 'Withdrawal Management', 'KYC Management', 'Banner Management',
        'Notification Panel', 'Referral Management', 'Reports', 'CMS',
        'Advertisement Management', 'Coupon Management', 'Fraud Detection',
        'Roles & Permissions', 'My Team Directory', 'Analytics', 'System Settings'
      ].map(m => ({ module: m, view: true, edit: false, delete: false, export: false }));

      const newRecord = new RolePermission({ role, permissions: defaultPerms });
      await newRecord.save();

      res.status(201).json({ success: true, message: `Role "${role}" created successfully.`, data: newRecord });
    } catch (err) {
      next(err);
    }
  };
}

export const rolePermissionController = new RolePermissionController();
