import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Result } from '../models/Result';
import { AuditLog } from '../models/AuditLog';
import { NotFoundError, ForbiddenError, BadRequestError } from '../core/errors';

export class AdminController {
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
      res.status(200).json({ success: true, logs });
    } catch (err) {
      next(err);
    }
  }

  async manualApproveQualification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resultId, status } = req.body;
      const result = await Result.findById(resultId);
      if (!result) {
        throw new NotFoundError('Result record not found.');
      }

      result.status = status;
      if (status === 'Qualified') {
        result.passed = true;
      } else {
        result.passed = false;
      }
      await result.save();

      res.status(200).json({ success: true, message: `Result manual override successful: marked ${status}.`, result });
    } catch (err) {
      next(err);
    }
  }

  async listUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.params;
      const loggedInUserId = (req as any).user.id;
      
      const adminRoles = [
        'Admin',
        'Super Admin',
        'Contest Manager',
        'Question Manager',
        'Finance Manager',
        'Support Manager',
        'Support Executive',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];
      
      const isParamAdmin = role === 'Admin' || adminRoles.includes(role);
      
      let users;
      if (isParamAdmin) {
        const { Admin } = require('../models/Admin');
        const query = role === 'Admin'
          ? { role: { $in: adminRoles } }
          : { role };
        users = await Admin.find(query).select('-password').sort({ createdAt: -1, _id: -1 });
      } else {
        const query = { role };
        users = await User.find(query).select('-password').sort({ createdAt: -1, _id: -1 });
      }

      console.log(`[AdminController] listUsersByRole called with role: "${role}". Found ${users.length} users.`);
      
      res.status(200).json({ success: true, users });
    } catch (err) {
      next(err);
    }
  }

  async promoteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, role } = req.body;
      const callerId = (req as any).user.id;

      const user = await User.findOne({ email });
      if (!user) {
        throw new NotFoundError('User not found.');
      }

      // Rule 11: Prevent changing your own role
      if (user._id.toString() === callerId) {
        throw new ForbiddenError('Access Denied: You cannot modify your own role.');
      }

      user.role = role;
      await user.save();

      await AuditLog.create({
        userId: callerId,
        action: 'Promote User',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        browser: 'Unknown Browser',
        details: `Promoted user ${email} to role: ${role}`
      });

      res.status(200).json({ success: true, message: `User ${email} promoted to role: ${role} successfully.`, user });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, username, email, phone, password, role, avatar } = req.body;
      const callerRole = (req as any).user.role;
      const callerId = (req as any).user.id;

      const adminRoles = [
        'Super Admin',
        'Admin',
        'Contest Manager',
        'Question Manager',
        'Finance Manager',
        'Support Manager',
        'Support Executive',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];

      // Rule 1: Super Admin role can ONLY be created by a Super Admin
      if (role === 'Super Admin' && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only a Super Admin can create a Super Admin account.');
      }

      // Rule 2: Admin role can ONLY be created by a Super Admin
      if (role === 'Admin' && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only a Super Admin can create an Admin account.');
      }

      // Rule 3: Other Manager/Staff roles can be created by Super Admin or Admin
      if (adminRoles.includes(role) && !['Super Admin', 'Admin'].includes(callerRole)) {
        throw new ForbiddenError('Access Denied: Only Super Admin or Admin can create team manager accounts.');
      }

      const { Admin } = require('../models/Admin');

      // Check unique constraints across both collections
      const emailExists = (await User.findOne({ email: email.toLowerCase() })) || (await Admin.findOne({ email: email.toLowerCase() }));
      if (emailExists) throw new BadRequestError('Email address already registered.');

      const usernameExists = (await User.findOne({ username: username.toLowerCase() })) || (await Admin.findOne({ username: username.toLowerCase() }));
      if (usernameExists) throw new BadRequestError('Username is already taken.');

      const phoneExists = (await User.findOne({ phone })) || (await Admin.findOne({ phone }));
      if (phoneExists) throw new BadRequestError('Mobile number already registered.');

      const userAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

      let newUser: any;
      if (adminRoles.includes(role)) {
        newUser = new Admin({
          name,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          phone,
          password,
          role,
          avatar: userAvatar,
          status: 'Active'
        });
      } else {
        newUser = new User({
          name,
          username,
          email,
          phone,
          password,
          role,
          status: 'Active',
          city: req.body.city || '',
          preferredLanguage: req.body.preferredLanguage || '',
          pincode: req.body.pincode || '',
          occupation: req.body.occupation || '',
          education: req.body.education || '',
          employmentStatus: req.body.employmentStatus || 'Unemployed',
          notificationPermission: !!req.body.notificationPermission,
          locationPermission: !!req.body.locationPermission,
          kycStatus: req.body.kycStatus || 'Pending'
        });
      }

      await newUser.save();

      // Create audit log
      await AuditLog.create({
        userId: callerId,
        action: 'Create User',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        browser: 'Unknown Browser',
        details: `Created user ${email} with role: ${role}`
      });

      res.status(201).json({ success: true, message: `User ${name} created successfully as ${role}.`, user: { id: newUser._id, name, username, email, role } });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, role } = req.body;
      const callerRole = (req as any).user.role;
      const callerId = (req as any).user.id;

      // Rule 11: Prevent editing yourself
      if (id === callerId) {
        throw new ForbiddenError('Access Denied: You cannot modify your own profile through user directory panel.');
      }

      const { Admin } = require('../models/Admin');
      let userToEdit = await Admin.findById(id);
      let isAdmin = true;
      if (!userToEdit) {
        userToEdit = await User.findById(id);
        isAdmin = false;
      }
      if (!userToEdit) {
        throw new NotFoundError('User not found.');
      }

      const adminRoles = [
        'Admin',
        'Super Admin',
        'Contest Manager',
        'Question Manager',
        'Finance Manager',
        'Support Manager',
        'Support Executive',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];

      // Rule 1: Super Admin role can ONLY be assigned by a Super Admin
      if (role === 'Super Admin' && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only a Super Admin can assign Super Admin role.');
      }

      // Rule 2: Admin role can ONLY be assigned by a Super Admin
      if (role === 'Admin' && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only a Super Admin can assign Admin role.');
      }

      // Rule 3: Only Super Admin or Admin can edit team accounts
      if (adminRoles.includes(userToEdit.role) && !['Super Admin', 'Admin'].includes(callerRole)) {
        throw new ForbiddenError('Access Denied: Only Super Admin or Admin can edit administrative accounts.');
      }

      const oldRole = userToEdit.role;
      userToEdit.name = name || userToEdit.name;
      userToEdit.email = email || userToEdit.email;
      userToEdit.phone = phone || userToEdit.phone;
      userToEdit.role = role || userToEdit.role;

      // Handle Collection Migration if role switches between administrative and user
      const wasAdmin = adminRoles.includes(oldRole);
      const nowAdmin = adminRoles.includes(userToEdit.role);

      if (wasAdmin && !nowAdmin) {
        // Move from Admin to User collection
        await Admin.findByIdAndDelete(id);
        const newUserDoc = new User({
          _id: userToEdit._id,
          name: userToEdit.name,
          username: userToEdit.username,
          email: userToEdit.email,
          phone: userToEdit.phone,
          password: userToEdit.password,
          role: userToEdit.role,
          status: userToEdit.status,
          walletBalance: userToEdit.walletBalance,
          kycStatus: userToEdit.kycStatus
        });
        await newUserDoc.save();
        userToEdit = newUserDoc;
      } else if (!wasAdmin && nowAdmin) {
        // Move from User to Admin collection
        await User.findByIdAndDelete(id);
        const newAdminDoc = new Admin({
          _id: userToEdit._id,
          name: userToEdit.name,
          username: userToEdit.username,
          email: userToEdit.email,
          phone: userToEdit.phone,
          password: userToEdit.password,
          role: userToEdit.role,
          status: userToEdit.status,
          walletBalance: userToEdit.walletBalance,
          kycStatus: userToEdit.kycStatus
        });
        await newAdminDoc.save();
        userToEdit = newAdminDoc;
      } else {
        await userToEdit.save();
      }

      // Create audit log
      await AuditLog.create({
        userId: callerId,
        action: 'Edit User',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        browser: 'Unknown Browser',
        details: `Edited user ${userToEdit.email} profile details.`
      });

      res.status(200).json({ success: true, message: `User ${userToEdit.name} updated successfully.`, user: userToEdit });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const callerRole = (req as any).user.role;
      const callerId = (req as any).user.id;

      // Rule 11: Prevent deleting yourself
      if (id === callerId) {
        throw new ForbiddenError('Access Denied: You cannot delete your own account.');
      }

      const { Admin } = require('../models/Admin');
      let userToDelete = await Admin.findById(id);
      let isDeleteAdmin = true;
      if (!userToDelete) {
        userToDelete = await User.findById(id);
        isDeleteAdmin = false;
      }
      if (!userToDelete) {
        throw new NotFoundError('User not found.');
      }

      const adminRoles = [
        'Admin',
        'Super Admin',
        'Contest Manager',
        'Question Manager',
        'Finance Manager',
        'Support Manager',
        'Support Executive',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];

      // Admin CANNOT delete Admin/Super Admin/Manager staff
      if (adminRoles.includes(userToDelete.role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can delete administrative or manager accounts.');
      }

      if (isDeleteAdmin) {
        await Admin.findByIdAndDelete(id);
      } else {
        await User.findByIdAndDelete(id);
      }

      // Create audit log
      await AuditLog.create({
        userId: callerId,
        action: 'Delete User',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        browser: 'Unknown Browser',
        details: `Deleted user account: ${userToDelete.email}`
      });

      res.status(200).json({ success: true, message: `User ${userToDelete.name} deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const callerRole = (req as any).user.role;
      const callerId = (req as any).user.id;

      // Rule 11: Prevent blocking yourself
      if (id === callerId) {
        throw new ForbiddenError('Access Denied: You cannot deactivate or suspend your own account.');
      }

      const { Admin } = require('../models/Admin');
      let userToToggle = await Admin.findById(id);
      let isToggleAdmin = true;
      if (!userToToggle) {
        userToToggle = await User.findById(id);
        isToggleAdmin = false;
      }
      if (!userToToggle) {
        throw new NotFoundError('User not found.');
      }

      const adminRoles = [
        'Admin',
        'Super Admin',
        'Contest Manager',
        'Question Manager',
        'Finance Manager',
        'Support Manager',
        'Support Executive',
        'Marketing Manager',
        'Content Moderator',
        'KYC Officer',
        'Analytics Manager'
      ];

      // Admin CANNOT suspend/disable Admin/Super Admin/Manager staff
      if (adminRoles.includes(userToToggle.role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can disable administrative or manager accounts.');
      }

      const nextStatus = userToToggle.status === 'Active' ? 'Suspended' : 'Active';
      userToToggle.status = nextStatus as any;
      await userToToggle.save();

      // Create audit log
      await AuditLog.create({
        userId: callerId,
        action: nextStatus === 'Suspended' ? 'Suspend User' : 'Activate User',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        browser: 'Unknown Browser',
        details: `${nextStatus === 'Suspended' ? 'Suspended' : 'Activated'} user account: ${userToToggle.email}`
      });

      res.status(200).json({ success: true, message: `User status updated to ${nextStatus} successfully.`, user: userToToggle });
    } catch (err) {
      next(err);
    }
  }

  async resetUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!password) throw new BadRequestError('New password is required.');

      const user = await User.findById(id);
      if (!user) throw new NotFoundError('Contestant user not found.');

      user.password = password; // Pre-save hook hashes password if schema is configured or saved
      await user.save();

      res.status(200).json({ success: true, message: `Password reset successfully for contestant ${user.name}.` });
    } catch (err) {
      next(err);
    }
  }

  async updateKycStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { kycStatus } = req.body;
      if (!kycStatus) throw new BadRequestError('KYC status is required.');

      const user = await User.findByIdAndUpdate(id, { kycStatus }, { new: true });
      if (!user) throw new NotFoundError('Contestant user not found.');

      res.status(200).json({ success: true, message: `KYC status updated to ${kycStatus} for contestant ${user.name}.`, user });
    } catch (err) {
      next(err);
    }
  }

  async adjustWalletBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, actionType, reason } = req.body;

      const user = await User.findById(id);
      if (!user) throw new NotFoundError('Contestant user not found.');

      const adjAmount = Number(amount || 0);

      if (actionType === 'Freeze') {
        user.status = 'Suspended';
      } else if (actionType === 'Unfreeze') {
        user.status = 'Active';
      } else if (actionType === 'Credit' || actionType === 'Bonus') {
        user.walletBalance = (user.walletBalance || 0) + Math.abs(adjAmount);
      } else if (actionType === 'Debit' || actionType === 'Penalty') {
        user.walletBalance = Math.max(0, (user.walletBalance || 0) - Math.abs(adjAmount));
      } else {
        user.walletBalance = (user.walletBalance || 0) + adjAmount;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: `Wallet ${actionType || 'adjustment'} processed for contestant ${user.name}.`,
        newBalance: user.walletBalance,
        status: user.status
      });
    } catch (err) {
      next(err);
    }
  }

  async getSidebarCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loggedInUserId = (req as any).user?.id;
      const { notificationService } = require('../services/NotificationService');
      const counts = await notificationService.getModuleUnreadCounts(loggedInUserId);

      res.status(200).json({
        success: true,
        counts
      });
    } catch (err) {
      res.status(200).json({
        success: true,
        counts: {
          contestant: 0,
          judge: 0,
          sponsor: 0,
          kyc: 0,
          contest: 0,
          finance: 0,
          support: 0,
          marketing: 0,
          analytics: 0,
          system: 0,
          total: 0
        }
      });
    }
  }
}
export const adminController = new AdminController();
export default adminController;
