import mongoose from 'mongoose';
import { Contest } from '../models/Contest';
import { GrandContest } from '../models/GrandContest';
import { DailyContest } from '../models/DailyContests';
import { socketService } from './SocketService';
import { logger } from '../core/logger';

export interface ScheduleStatusEvaluation {
  targetStatus: string;
  reason: string;
}

/**
 * Calculates the expected status for a Contest or GrandContest based on schedule dates.
 */
export function getTargetContestStatus(
  contest: {
    status?: string;
    registrationStart?: Date | string | null;
    registrationEnd?: Date | string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
  },
  now: Date = new Date()
): ScheduleStatusEvaluation | null {
  if (!contest) return null;

  // Don't auto-modify manual administrative override states
  if (contest.status === 'Cancelled' || contest.status === 'Maintenance') {
    return null;
  }

  const nowMs = now.getTime();
  const regStartMs = contest.registrationStart ? new Date(contest.registrationStart).getTime() : null;
  const regEndMs = contest.registrationEnd ? new Date(contest.registrationEnd).getTime() : null;
  const startMs = contest.startDate ? new Date(contest.startDate).getTime() : null;
  const endMs = contest.endDate ? new Date(contest.endDate).getTime() : null;

  const validRegStart = typeof regStartMs === 'number' && !isNaN(regStartMs);
  const validRegEnd = typeof regEndMs === 'number' && !isNaN(regEndMs);
  const validStart = typeof startMs === 'number' && !isNaN(startMs);
  const validEnd = typeof endMs === 'number' && !isNaN(endMs);

  if (!validRegStart && !validRegEnd && !validStart && !validEnd) {
    return null;
  }

  // 1. Contest Execution Ended (End time passed)
  if (validEnd && nowMs >= endMs) {
    return { targetStatus: 'Completed', reason: `Execution end time reached (${new Date(endMs).toISOString()})` };
  }

  // 2. Contest Execution Live (Start time passed, and not ended yet)
  if (validStart && nowMs >= startMs) {
    if (!validEnd || nowMs < endMs) {
      return { targetStatus: 'Live', reason: `Execution start time reached (${new Date(startMs).toISOString()})` };
    }
  }

  // 3. Before Contest Start:
  // 3a. Registration Closed (regEnd passed, but contest start in future)
  if (validRegEnd && nowMs >= regEndMs) {
    return { targetStatus: 'Registration Closed', reason: `Registration deadline closed (${new Date(regEndMs).toISOString()})` };
  }

  // 3b. Registration Open (regStart passed, and regEnd not reached, and start not reached)
  if (validRegStart && nowMs >= regStartMs) {
    if (!validRegEnd || nowMs < regEndMs) {
      if (!validStart || nowMs < startMs) {
        return { targetStatus: 'Registration Open', reason: `Registration window opened (${new Date(regStartMs).toISOString()})` };
      }
    }
  }

  // 3c. Upcoming (regStart is in future, or start is in future)
  if (validRegStart && nowMs < regStartMs) {
    return { targetStatus: 'Upcoming', reason: `Registration will open on ${new Date(regStartMs).toISOString()}` };
  }

  if (validStart && nowMs < startMs) {
    return { targetStatus: 'Upcoming', reason: `Contest will start on ${new Date(startMs).toISOString()}` };
  }

  return null;
}

export class ContestScheduleAutomationService {
  private timer: NodeJS.Timeout | null = null;
  private isChecking: boolean = false;

  /**
   * Start the recurring background automation scheduler (defaults to every 30 seconds)
   */
  public startAutomation(intervalMs: number = 30000) {
    if (this.timer) {
      return;
    }
    logger.info(`[ContestScheduleAutomationService] Started background schedule check loop (interval: ${intervalMs}ms).`);
    this.timer = setInterval(() => this.runCheck(), intervalMs);
    // Run an initial check shortly after boot
    setTimeout(() => this.runCheck(), 2000);
  }

  public stopAutomation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('[ContestScheduleAutomationService] Stopped background schedule automation loop.');
    }
  }

  /**
   * Main check loop that checks Contest, GrandContest, and DailyContest models
   */
  public async runCheck(): Promise<{
    contestsUpdated: number;
    grandContestsUpdated: number;
    dailyContestsUpdated: number;
    updates: Array<{ id: string; type: string; title: string; oldStatus: string; newStatus: string; reason: string }>;
  }> {
    if (mongoose.connection.readyState !== 1 || this.isChecking) {
      return { contestsUpdated: 0, grandContestsUpdated: 0, dailyContestsUpdated: 0, updates: [] };
    }

    this.isChecking = true;
    const now = new Date();
    const updates: Array<{ id: string; type: string; title: string; oldStatus: string; newStatus: string; reason: string }> = [];

    try {
      // 1. Check Standard Contests
      const contests = await Contest.find({
        status: { $nin: ['Cancelled', 'Maintenance'] }
      }).exec();

      for (const c of contests) {
        const evalResult = getTargetContestStatus(c, now);
        if (evalResult && evalResult.targetStatus !== c.status) {
          const oldStatus = c.status;
          c.status = evalResult.targetStatus as any;
          await c.save();

          logger.info(`[ContestSchedule] Standard Contest '${c.title}' (${c.contestId}) status changed: ${oldStatus} -> ${evalResult.targetStatus} (${evalResult.reason})`);

          updates.push({
            id: c._id.toString(),
            type: 'Contest',
            title: c.title,
            oldStatus,
            newStatus: evalResult.targetStatus,
            reason: evalResult.reason
          });

          // Broadcast real-time socket event
          socketService.broadcast('contest:status_changed', {
            type: 'Contest',
            contestId: c.contestId,
            id: c._id,
            title: c.title,
            oldStatus,
            newStatus: evalResult.targetStatus,
            contest: c
          });
          socketService.broadcast('contest:update', c);
        }
      }

      // 2. Check Grand Contests
      const grandContests = await GrandContest.find({
        status: { $nin: ['Cancelled', 'Maintenance'] }
      }).exec();

      for (const gc of grandContests) {
        const evalResult = getTargetContestStatus(gc, now);
        if (evalResult && evalResult.targetStatus !== gc.status) {
          const oldStatus = gc.status;
          gc.status = evalResult.targetStatus as any;
          await gc.save();

          logger.info(`[ContestSchedule] Grand Contest '${gc.title}' (${gc.contestId}) status changed: ${oldStatus} -> ${evalResult.targetStatus} (${evalResult.reason})`);

          updates.push({
            id: gc._id.toString(),
            type: 'GrandContest',
            title: gc.title,
            oldStatus,
            newStatus: evalResult.targetStatus,
            reason: evalResult.reason
          });

          socketService.broadcast('grand_contest:status_changed', {
            type: 'GrandContest',
            contestId: gc.contestId,
            id: gc._id,
            title: gc.title,
            oldStatus,
            newStatus: evalResult.targetStatus,
            contest: gc
          });
        }
      }

      // 3. Check Daily Contests (Daily reset and time window checks)
      const dailyContests = await DailyContest.find({
        status: { $nin: ['Maintenance'] }
      }).exec();

      let dailyUpdatedCount = 0;
      for (const dc of dailyContests) {
        let changed = false;

        // Auto-reset check
        if (dc.autoReset && dc.nextResetAt && now >= new Date(dc.nextResetAt)) {
          dc.participantsCount = 0;
          dc.participants = [];
          dc.lastResetAt = now;
          const hours = dc.resetIntervalHours || 24;
          dc.nextResetAt = new Date(now.getTime() + hours * 3600 * 1000);
          dc.status = 'Registration Open';
          changed = true;
          logger.info(`[ContestSchedule] Daily Contest '${dc.title}' automatically reset for next cycle.`);
        }

        // Daily time window check if dailyStartTime/dailyEndTime are defined
        if (dc.dailyStartTime && dc.dailyEndTime) {
          const [startH, startM] = dc.dailyStartTime.split(':').map(Number);
          const [endH, endM] = dc.dailyEndTime.split(':').map(Number);
          const currentMins = now.getHours() * 60 + now.getMinutes();
          const startMins = (startH || 0) * 60 + (startM || 0);
          const endMins = (endH || 0) * 60 + (endM || 0);

          let expectedStatus = dc.status;
          if (currentMins >= endMins) {
            expectedStatus = 'Completed';
          } else if (currentMins >= startMins) {
            expectedStatus = 'Active';
          } else {
            expectedStatus = 'Upcoming';
          }

          if (expectedStatus !== dc.status && dc.status !== 'Draft') {
            const oldStatus = dc.status;
            dc.status = expectedStatus as any;
            changed = true;
            logger.info(`[ContestSchedule] Daily Contest '${dc.title}' time status shifted: ${oldStatus} -> ${expectedStatus}`);
            updates.push({
              id: dc._id.toString(),
              type: 'DailyContest',
              title: dc.title,
              oldStatus,
              newStatus: expectedStatus,
              reason: `Daily active window check (${dc.dailyStartTime} - ${dc.dailyEndTime})`
            });
          }
        }

        if (changed) {
          await dc.save();
          dailyUpdatedCount++;
          socketService.broadcast('daily_contest:status_changed', {
            type: 'DailyContest',
            dailyContestId: dc.dailyContestId,
            id: dc._id,
            status: dc.status,
            contest: dc
          });
        }
      }

      return {
        contestsUpdated: updates.filter(u => u.type === 'Contest').length,
        grandContestsUpdated: updates.filter(u => u.type === 'GrandContest').length,
        dailyContestsUpdated: dailyUpdatedCount,
        updates
      };
    } catch (err: any) {
      logger.error(`[ContestScheduleAutomationService] Error during schedule check: ${err.message}`);
      return { contestsUpdated: 0, grandContestsUpdated: 0, dailyContestsUpdated: 0, updates: [] };
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Synchronizes and evaluates a single Contest doc on-the-fly (useful for getContestById)
   */
  public async checkAndUpdateSingleContest(contestDoc: any): Promise<boolean> {
    if (!contestDoc) return false;
    const evalResult = getTargetContestStatus(contestDoc, new Date());
    if (evalResult && evalResult.targetStatus !== contestDoc.status) {
      const oldStatus = contestDoc.status;
      contestDoc.status = evalResult.targetStatus;
      await contestDoc.save();
      logger.info(`[ContestSchedule] Synchronously updated '${contestDoc.title}' status: ${oldStatus} -> ${evalResult.targetStatus}`);
      socketService.broadcast('contest:status_changed', {
        type: 'Contest',
        contestId: contestDoc.contestId,
        id: contestDoc._id,
        title: contestDoc.title,
        oldStatus,
        newStatus: evalResult.targetStatus,
        contest: contestDoc
      });
      return true;
    }
    return false;
  }

  /**
   * Synchronizes and evaluates a single GrandContest doc on-the-fly
   */
  public async checkAndUpdateSingleGrandContest(grandContestDoc: any): Promise<boolean> {
    if (!grandContestDoc) return false;
    const evalResult = getTargetContestStatus(grandContestDoc, new Date());
    if (evalResult && evalResult.targetStatus !== grandContestDoc.status) {
      const oldStatus = grandContestDoc.status;
      grandContestDoc.status = evalResult.targetStatus;
      await grandContestDoc.save();
      logger.info(`[ContestSchedule] Synchronously updated GrandContest '${grandContestDoc.title}' status: ${oldStatus} -> ${evalResult.targetStatus}`);
      socketService.broadcast('grand_contest:status_changed', {
        type: 'GrandContest',
        contestId: grandContestDoc.contestId,
        id: grandContestDoc._id,
        title: grandContestDoc.title,
        oldStatus,
        newStatus: evalResult.targetStatus,
        contest: grandContestDoc
      });
      return true;
    }
    return false;
  }
}

export const contestScheduleAutomationService = new ContestScheduleAutomationService();
export default contestScheduleAutomationService;
