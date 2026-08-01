import SurveyRepository from '../repositories/SurveyRepository';
import { ISurvey } from '../models/Survey';
import { NotFoundError, BadRequestError } from '../core/errors';

export class SurveyService {
  private repo = new SurveyRepository();

  async listSurveys(): Promise<ISurvey[]> {
    return this.repo.find({});
  }

  async getSurveyById(id: string): Promise<ISurvey> {
    const survey = await this.repo.findById(id);
    if (!survey) {
      throw new NotFoundError('Survey not found');
    }
    return survey;
  }

  async createSurvey(data: Partial<ISurvey>): Promise<ISurvey> {
    if (!data.title) {
      throw new BadRequestError('Survey title is required');
    }
    const surveyId = `SRV-${Date.now().toString().slice(-4)}`;
    const newSurveyData = {
      surveyId,
      title: data.title,
      description: data.description || '',
      questions: data.questions || [],
      targetGroup: data.targetGroup || 'All Registered Users',
      reward: data.reward || '50 Bonus Coins',
      schedule: data.schedule || 'Active Campaign',
      startDate: data.startDate,
      endDate: data.endDate,
      responses: 0,
      status: data.status || 'Active'
    };

    return this.repo.create(newSurveyData);
  }

  async updateSurvey(id: string, updates: Partial<ISurvey>): Promise<ISurvey> {
    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('Survey not found');
    }
    return updated;
  }

  async deleteSurvey(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Survey not found');
    }
  }

  async toggleStatus(id: string): Promise<ISurvey> {
    const survey = await this.getSurveyById(id);
    const newStatus = survey.status === 'Active' ? 'Inactive' : 'Active';
    return this.updateSurvey(id, { status: newStatus as any });
  }

  async getAnalytics(id: string): Promise<any> {
    const survey = await this.getSurveyById(id);
    const totalResponses = survey.responses || 0;

    const questionBreakdown = (survey.questions || []).map((q) => {
      const totalQuestionVotes = (q.options || []).reduce((sum, opt) => sum + (opt.count || 0), 0) || 1;
      const optionsAnalytics = (q.options || []).map((opt) => ({
        optionId: opt.optionId,
        text: opt.text,
        count: opt.count || 0,
        percentage: Math.round(((opt.count || 0) / totalQuestionVotes) * 100)
      }));

      return {
        questionId: q.questionId,
        title: q.title,
        type: q.type,
        totalVotes: totalQuestionVotes,
        options: optionsAnalytics
      };
    });

    return {
      surveyId: survey.surveyId,
      title: survey.title,
      targetGroup: survey.targetGroup,
      reward: survey.reward,
      responses: totalResponses,
      status: survey.status,
      questionBreakdown
    };
  }
}

export const surveyService = new SurveyService();
export default surveyService;
