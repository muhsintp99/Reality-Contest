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
      
      // Rule 10: Exclude currently logged-in user and filter by role
      const users = await User.find({ 
        role, 
        _id: { $ne: loggedInUserId } 
      }).select('-password');
      
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
      const { name, username, email, phone, password, role } = req.body;
      const callerRole = (req as any).user.role;
      const callerId = (req as any).user.id;

      // Super Admin is the ONLY role that can create Admin/Super Admin accounts
      if (['Admin', 'Super Admin'].includes(role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can create Admin or Super Admin accounts.');
      }

      // Check unique constraints
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) throw new BadRequestError('Email address already registered.');

      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) throw new BadRequestError('Username is already taken.');

      const phoneExists = await User.findOne({ phone });
      if (phoneExists) throw new BadRequestError('Mobile number already registered.');

      const newUser = new User({
        name,
        username,
        email,
        phone,
        password,
        role,
        status: 'Active'
      });

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

      const userToEdit = await User.findById(id);
      if (!userToEdit) {
        throw new NotFoundError('User not found.');
      }

      // Admin CANNOT edit Admin/Super Admin
      if (['Admin', 'Super Admin'].includes(userToEdit.role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can edit Admin or Super Admin accounts.');
      }

      // Admin CANNOT promote anyone to Admin/Super Admin
      if (['Admin', 'Super Admin'].includes(role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can assign Admin or Super Admin roles.');
      }

      userToEdit.name = name || userToEdit.name;
      userToEdit.email = email || userToEdit.email;
      userToEdit.phone = phone || userToEdit.phone;
      userToEdit.role = role || userToEdit.role;

      await userToEdit.save();

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

      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        throw new NotFoundError('User not found.');
      }

      // Admin CANNOT delete Admin/Super Admin
      if (['Admin', 'Super Admin'].includes(userToDelete.role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can delete Admin or Super Admin accounts.');
      }

      await User.findByIdAndDelete(id);

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

      const userToToggle = await User.findById(id);
      if (!userToToggle) {
        throw new NotFoundError('User not found.');
      }

      // Admin CANNOT suspend/disable Admin/Super Admin
      if (['Admin', 'Super Admin'].includes(userToToggle.role) && callerRole !== 'Super Admin') {
        throw new ForbiddenError('Access Denied: Only Super Admin can disable Admin or Super Admin accounts.');
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
}
export const adminController = new AdminController();
export default adminController;
