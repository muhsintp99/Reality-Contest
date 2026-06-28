import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logger } from '../core/logger';
import { AppError } from '../core/errors';

// Ensure upload directory exists locally
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage setup configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Create Multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Max 50MB
  }
});

export class UploadController {
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded.', 400);
      }
      
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      logger.info(`File uploaded locally: ${req.file.filename} -> ${fileUrl}`);

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully to local storage.',
        fileUrl
      });
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();
export default uploadController;
