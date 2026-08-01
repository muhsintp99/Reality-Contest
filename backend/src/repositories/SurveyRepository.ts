import BaseRepository from './BaseRepository';
import Survey, { ISurvey } from '../models/Survey';

export class SurveyRepository extends BaseRepository<ISurvey> {
  constructor() {
    super(Survey);
  }

  async findByStatus(status: string): Promise<ISurvey[]> {
    return this.find({ status });
  }

  async findBySurveyId(surveyId: string): Promise<ISurvey | null> {
    return this.findOne({ surveyId });
  }
}
export default SurveyRepository;
