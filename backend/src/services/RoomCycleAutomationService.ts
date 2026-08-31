import mongoose from 'mongoose';
import Cycle from '../models/Cycle';
import RoomTask from '../models/RoomTask';
import RoomSubmission from '../models/RoomSubmission';
import CycleLog from '../models/CycleLog';
import { biWeeklyRoomCycleService } from './BiWeeklyRoomCycleService';
import { socketService } from './SocketService';
import { logger } from '../core/logger';

export class RoomCycleAutomationService {
  private timer: NodeJS.Timeout | null = null;

  startAutomation(intervalMs: number = 60000) {
    logger.info('[RoomCycleAutomationService] Started background automation loop.');
    this.timer = setInterval(() => this.runCheck(), intervalMs);
    this.runCheck(); // Initial run on start
  }

  stopAutomation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('[RoomCycleAutomationService] Stopped automation loop.');
    }
  }

  async runCheck() {
    // Skip automated check if database is not connected
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    try {
      const now = new Date();


      // 1. Auto End Active Cycle if endDate passed
      const activeCycle = await Cycle.findOne({ status: 'Active', autoEnd: true });
      if (activeCycle && activeCycle.endDate <= now) {
        activeCycle.status = 'Completed';
        activeCycle.completionPercentage = 100;
        await activeCycle.save();

        await CycleLog.create({
          eventType: 'CYCLE_END',
          cycleId: activeCycle._id,
          message: `Cycle ${activeCycle.cycleNumber} automatically completed on ${now.toISOString()}`
        });

        // Activate Next Cycle if exists
        const nextCycle = await Cycle.findOne({ cycleNumber: activeCycle.cycleNumber + 1 });
        if (nextCycle) {
          nextCycle.status = 'Active';
          nextCycle.startDate = now;
          await nextCycle.save();

          await CycleLog.create({
            eventType: 'CYCLE_START',
            cycleId: nextCycle._id,
            message: `Cycle ${nextCycle.cycleNumber} automatically activated.`
          });

          socketService.broadcast('CYCLE_STARTED', { cycleNumber: nextCycle.cycleNumber });
        }

        // Lock Submissions & Recalculate Final Leaderboard
        await this.autoLockSubmissions(activeCycle._id.toString());
        await biWeeklyRoomCycleService.recalculateLeaderboard(activeCycle._id.toString());
        await biWeeklyRoomCycleService.distributeRewards();
      }

      // 2. Auto-close overdue tasks
      await RoomTask.updateMany(
        { status: 'Active', deadline: { $lte: now } },
        { status: 'Closed' }
      );
    } catch (err: any) {
      logger.error('[RoomCycleAutomationService] Error during automated cycle check:', err.message);
    }
  }

  private async autoLockSubmissions(cycleId: string) {
    await RoomTask.updateMany({ cycleId, status: 'Active' }, { status: 'Closed' });
    await CycleLog.create({
      eventType: 'SUBMISSION_LOCK',
      cycleId: cycleId as any,
      message: `Submissions locked for cycle ID ${cycleId}`
    });
  }
}

export const roomCycleAutomationService = new RoomCycleAutomationService();
