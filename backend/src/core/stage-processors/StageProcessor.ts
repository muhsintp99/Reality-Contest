import { IStage } from '../../models/Stage';
import { IAttempt } from '../../models/Attempt';
import { IUser } from '../../models/User';

export interface StageStartPayload {
  ipAddress: string;
  deviceInfo: string;
  browser: string;
}

export interface StageSubmitPayload {
  answers: any;
  cheatAlerts?: any[];
  ipAddress: string;
  deviceInfo: string;
  browser: string;
}

export interface EvaluationResult {
  score: number;
  passed: boolean;
  maxScore: number;
  status: 'Qualified' | 'Failed' | 'Pending Review';
  remarks?: string;
  evaluatedAnswers?: any;
}

export interface IStageProcessor {
  validateStart(stage: IStage, user: IUser): Promise<void>;
  startAttempt(stage: IStage, user: IUser, payload: StageStartPayload): Promise<any>;
  evaluate(stage: IStage, attempt: IAttempt, payload: StageSubmitPayload): Promise<EvaluationResult>;
}
