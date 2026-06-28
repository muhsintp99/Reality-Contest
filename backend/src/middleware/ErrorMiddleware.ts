import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors';
import { logger } from '../core/logger';
import { config } from '../config/appConfig';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = config.NODE_ENV === 'production';

  // Log error via Winston
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip} \nStack: ${err.stack}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.constructor.name === 'ValidationError' ? { errors: (err as any).errors } : {}),
      ...(!isProduction ? { stack: err.stack } : {})
    });
    return;
  }

  // Handle mongoose validation/cast errors specifically
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Database Validation Error',
      errors: (err as any).errors,
      ...(!isProduction ? { stack: err.stack } : {})
    });
    return;
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message,
    ...(!isProduction ? { stack: err.stack } : {})
  });
};
export default errorHandler;
