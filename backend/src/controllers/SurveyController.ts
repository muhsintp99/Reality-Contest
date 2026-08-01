import { Request, Response, NextFunction } from 'express';
import { surveyService } from '../services/SurveyService';

export class SurveyController {
  async listSurveys(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const surveys = await surveyService.listSurveys();
      res.status(200).json({ success: true, surveys });
    } catch (err) {
      next(err);
    }
  }

  async getSurveyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const survey = await surveyService.getSurveyById(req.params.id);
      res.status(200).json({ success: true, survey });
    } catch (err) {
      next(err);
    }
  }

  async createSurvey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const survey = await surveyService.createSurvey(req.body);
      res.status(201).json({ success: true, message: 'Survey created successfully', survey });
    } catch (err) {
      next(err);
    }
  }

  async updateSurvey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const survey = await surveyService.updateSurvey(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Survey updated successfully', survey });
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const survey = await surveyService.toggleStatus(req.params.id);
      res.status(200).json({ success: true, message: `Survey status toggled to ${survey.status}`, survey });
    } catch (err) {
      next(err);
    }
  }

  async deleteSurvey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await surveyService.deleteSurvey(req.params.id);
      res.status(200).json({ success: true, message: 'Survey deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await surveyService.getAnalytics(req.params.id);
      res.status(200).json({ success: true, analytics });
    } catch (err) {
      next(err);
    }
  }
}

export const surveyController = new SurveyController();
export default surveyController;
