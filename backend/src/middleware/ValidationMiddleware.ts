import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';
import { ValidationError } from '../core/errors';

export const validateRequest = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      // Replace request body with the strictly parsed values
      req.body = parsed;
      next();
    } catch (err: any) {
      if (err.errors) {
        next(new ValidationError('Input validation failed', err.errors));
      } else {
        next(err);
      }
    }
  };
};
export default validateRequest;
