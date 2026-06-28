import { IStageProcessor, StageStartPayload, StageSubmitPayload, EvaluationResult } from './StageProcessor';
import { IStage } from '../../models/Stage';
import { IAttempt } from '../../models/Attempt';
import { IUser } from '../../models/User';
import { Attempt } from '../../models/Attempt';
import { BadRequestError } from '../errors';

export class DefaultStageProcessor implements IStageProcessor {
  async validateStart(stage: IStage, user: IUser): Promise<void> {
    const attemptCount = await Attempt.countDocuments({
      userId: user._id,
      stageId: stage._id,
      status: { $in: ['Submitted', 'Evaluated'] }
    });

    if (stage.maxAttempts > 0 && attemptCount >= stage.maxAttempts) {
      throw new BadRequestError(`Maximum attempts (${stage.maxAttempts}) reached for this stage.`);
    }
  }

  async startAttempt(stage: IStage, user: IUser, payload: StageStartPayload): Promise<any> {
    return {
      message: `Please complete the ${stage.type} requirements.`,
      instructions: stage.rules.instructions,
      rules: stage.rules
    };
  }

  async evaluate(stage: IStage, attempt: IAttempt, payload: StageSubmitPayload): Promise<EvaluationResult> {
    // For non-quiz stages, evaluations are manual/judge-driven.
    // We mark the submission as Pending Review, score at 0.
    return {
      score: 0,
      passed: false,
      maxScore: stage.passingScore || 100,
      status: 'Pending Review',
      remarks: 'Awaiting judge evaluation and validation.',
      evaluatedAnswers: payload.answers
    };
  }
}
export default DefaultStageProcessor;
