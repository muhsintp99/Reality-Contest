import { IStageProcessor, StageStartPayload, StageSubmitPayload, EvaluationResult } from './StageProcessor';
import { IStage } from '../../models/Stage';
import { IAttempt } from '../../models/Attempt';
import { IUser } from '../../models/User';
import { Question } from '../../models/Question';
import { Attempt } from '../../models/Attempt';
import { BadRequestError } from '../errors';

export class QuizStageProcessor implements IStageProcessor {
  async validateStart(stage: IStage, user: IUser): Promise<void> {
    const attemptCount = await Attempt.countDocuments({
      userId: user._id,
      stageId: stage._id,
      status: 'Evaluated'
    });

    if (stage.maxAttempts > 0 && attemptCount >= stage.maxAttempts) {
      throw new BadRequestError(`Maximum attempts (${stage.maxAttempts}) reached for this stage.`);
    }
  }

  async startAttempt(stage: IStage, user: IUser, payload: StageStartPayload): Promise<any> {
    const poolId = stage.config.questionPoolId;
    if (!poolId) {
      throw new BadRequestError('Stage is misconfigured: Question pool ID is missing.');
    }

    // Retrieve questions in pool
    let questions = await Question.find({ poolId });
    if (!questions || questions.length === 0) {
      throw new BadRequestError('Question pool is empty. Please contact the administrator.');
    }

    // Shuffle questions if configured
    if (stage.config.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Limit questions count if configured
    if (stage.config.limitQuestions && stage.config.limitQuestions > 0) {
      questions = questions.slice(0, stage.config.limitQuestions);
    }

    // Prepare questions for contestant (strip out correctness answers)
    const clientQuestions = questions.map((q) => {
      let options = q.options.map((opt) => ({
        text: opt.text,
        mediaUrl: opt.mediaUrl
      }));

      // Shuffle options if configured
      if (stage.config.shuffleOptions) {
        options = options.sort(() => Math.random() - 0.5);
      }

      return {
        _id: q._id,
        text: q.text,
        type: q.type,
        mediaUrl: q.mediaUrl,
        questionTimer: q.questionTimer,
        options
      };
    });

    return {
      questions: clientQuestions,
      timeLimit: stage.timeLimit,
      rules: stage.rules
    };
  }

  async evaluate(stage: IStage, attempt: IAttempt, payload: StageSubmitPayload): Promise<EvaluationResult> {
    const poolId = stage.config.questionPoolId;
    if (!poolId) {
      throw new BadRequestError('Stage is misconfigured: Question pool ID is missing.');
    }

    const questions = await Question.find({ poolId });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const userAnswers = payload.answers || {}; // format: { questionId: [selectedIndices] or chosenIndex }
    let totalScore = 0;
    let maxPossibleScore = 0;

    const evaluatedAnswers: Record<string, any> = {};

    for (const q of questions) {
      maxPossibleScore += q.marks;
      const qIdStr = q._id.toString();
      const submitted = userAnswers[qIdStr];

      let isCorrect = false;
      let obtainedMarks = 0;

      if (submitted !== undefined) {
        // Compare values
        const correctIndices = q.options
          .map((opt, idx) => (opt.isCorrect ? idx : -1))
          .filter((val) => val !== -1);

        if (q.type === 'Single Choice' || q.type === 'True False') {
          const answerVal = Number(submitted);
          if (correctIndices.includes(answerVal)) {
            isCorrect = true;
          }
        } else if (q.type === 'Multiple Choice') {
          const answerArray = Array.isArray(submitted) ? submitted.map(Number) : [Number(submitted)];
          const matchesAll =
            correctIndices.length === answerArray.length &&
            correctIndices.every((val) => answerArray.includes(val));
          if (matchesAll) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          obtainedMarks = q.marks;
        } else {
          obtainedMarks = -Math.abs(q.negativeMarks || 0);
        }
      }

      totalScore += obtainedMarks;
      evaluatedAnswers[qIdStr] = {
        submitted,
        correct: isCorrect,
        score: obtainedMarks
      };
    }

    // Prevent negative overall scores if configuration doesn't allow it
    if (totalScore < 0) {
      totalScore = 0;
    }

    // Determine passed status
    let passed = false;
    if (stage.passingScore > 0) {
      passed = totalScore >= stage.passingScore;
    } else if (stage.passingPercentage > 0 && maxPossibleScore > 0) {
      const percentage = (totalScore / maxPossibleScore) * 100;
      passed = percentage >= stage.passingPercentage;
    } else {
      // Default true if no criteria specified
      passed = true;
    }

    return {
      score: totalScore,
      passed,
      maxScore: maxPossibleScore,
      status: passed ? 'Qualified' : 'Failed',
      remarks: passed ? 'Passed the Quiz stage.' : 'Failed to meet the passing requirements.',
      evaluatedAnswers
    };
  }
}
export default QuizStageProcessor;
