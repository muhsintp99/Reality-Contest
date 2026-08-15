import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logger } from '../core/logger';
import { AppError } from '../core/errors';

const baseUploadDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Function to extract target folder from request (params, query, body, or headers)
export const getTargetFolder = (req: Request): string => {
  const folderRaw = (
    (req.params && req.params.folder) ||
    (req.query && req.query.folder) ||
    (req.body && req.body.folder) ||
    (req.headers && (req.headers['x-folder-name'] as string)) ||
    'general'
  ).toString().trim().toLowerCase();

  const folder = folderRaw.replace(/[^a-z0-9_-]/g, '') || 'general';
  return folder;
};

// Helper function to safely delete local file from disk
export const removeLocalFile = (fileUrlOrPath: string): boolean => {
  if (!fileUrlOrPath) return false;
  try {
    let relPath = fileUrlOrPath;
    if (fileUrlOrPath.includes('/uploads/')) {
      relPath = fileUrlOrPath.split('/uploads/')[1];
    }
    relPath = relPath.replace(/^\/+/, '');

    // Prevent path traversal
    const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.join(baseUploadDir, safePath);

    if (absolutePath.startsWith(baseUploadDir) && fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      logger.info(`Successfully deleted local upload file: ${absolutePath}`);
      return true;
    }
  } catch (err) {
    logger.warn(`Failed to delete local upload file (${fileUrlOrPath}):`, err);
  }
  return false;
};

// Multer Disk Storage setup configuration with dynamic destination folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getTargetFolder(req);
    const targetDir = path.join(baseUploadDir, folder);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomHash = Math.round(Math.random() * 1e4);
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Extract base original filename without extension and sanitize
    const rawBase = path.basename(file.originalname, path.extname(file.originalname));
    const cleanOriginalName = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').substring(0, 50);

    const folder = getTargetFolder(req);
    const finalFilename = cleanOriginalName 
      ? `${cleanOriginalName}_${timestamp}_${randomHash}${ext}`
      : `${folder}_file_${timestamp}_${randomHash}${ext}`;

    cb(null, finalFilename);
  }
});

// Create Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // Max 100MB
  }
});

export class UploadController {
  // Upload File
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded.', 400);
      }
      
      const folder = getTargetFolder(req);
      const relativeUrl = `/uploads/${folder}/${req.file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
      const relativePath = `public/uploads/${folder}/${req.file.filename}`;

      logger.info(`File uploaded locally: ${relativePath} -> ${relativeUrl}`);

      res.status(200).json({
        success: true,
        message: `File uploaded successfully to public/uploads/${folder}`,
        folder,
        filename: req.file.filename,
        relativePath,
        fileUrl: relativeUrl,
        fullUrl
      });
    } catch (err) {
      next(err);
    }
  }

  // Update / Replace File (Deletes old file if oldFileUrl provided)
  async updateFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No new file uploaded for replacement.', 400);
      }

      const oldFileUrl = req.body?.oldFileUrl || req.query?.oldFileUrl;
      if (oldFileUrl) {
        removeLocalFile(oldFileUrl.toString());
      }

      const folder = getTargetFolder(req);
      const relativeUrl = `/uploads/${folder}/${req.file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
      const relativePath = `public/uploads/${folder}/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: `File replaced successfully in public/uploads/${folder}`,
        folder,
        filename: req.file.filename,
        relativePath,
        fileUrl: relativeUrl,
        fullUrl
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete File
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileUrlOrPath = (
        req.body?.fileUrl ||
        req.query?.fileUrl ||
        req.body?.path ||
        req.query?.path ||
        ''
      ).toString();

      if (!fileUrlOrPath) {
        throw new AppError('fileUrl or path is required to delete file.', 400);
      }

      const deleted = removeLocalFile(fileUrlOrPath);
      res.status(200).json({
        success: true,
        message: deleted ? 'File deleted successfully from disk.' : 'File not found or already deleted.',
        deleted
      });
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();
export default uploadController;
