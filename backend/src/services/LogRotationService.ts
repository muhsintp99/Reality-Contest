import fs from 'fs';
import path from 'path';
import { logger } from '../core/logger';

export class LogRotationService {
  private timer: NodeJS.Timeout | null = null;
  private readonly retentionHours: number = 24;

  /**
   * Purges log lines older than the specified retention hours (default: 24h)
   */
  public purgeLogsOlderThan(hours: number = 24): { purgedFiles: number; linesKept: number; linesRemoved: number } {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const logDir = path.resolve(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (err) {
        return { purgedFiles: 0, linesKept: 0, linesRemoved: 0 };
      }
    }

    const logFiles = [
      'pm2-out.log',
      'pm2-error.log',
      'combined.log',
      'error.log',
      'app.log'
    ];

    let totalKept = 0;
    let totalRemoved = 0;
    let filesProcessed = 0;

    for (const filename of logFiles) {
      const filePath = path.join(logDir, filename);
      if (!fs.existsSync(filePath)) continue;

      try {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let keptLines: string[] = [];
        let removedCount = 0;

        for (const line of lines) {
          if (!line.trim()) continue;

          // Attempt to extract timestamp: [2026-10-10 06:00:57:057] or 2026-10-10T...
          const match = line.match(/^\[(.*?)\]/) || line.match(/(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})/);
          if (match) {
            const rawDateStr = match[1] || match[0];
            const parsedTime = Date.parse(rawDateStr.replace(' ', 'T'));
            if (!isNaN(parsedTime)) {
              if (parsedTime >= cutoffTime) {
                keptLines.push(line);
              } else {
                removedCount++;
              }
              continue;
            }
          }

          // Fallback: If line has no timestamp, keep if file is within 24h or take last 500 lines
          if (stats.mtimeMs >= cutoffTime) {
            keptLines.push(line);
          } else {
            removedCount++;
          }
        }

        // Only rewrite if lines were actually purged
        if (removedCount > 0) {
          fs.writeFileSync(filePath, keptLines.join('\n') + (keptLines.length ? '\n' : ''), 'utf8');
        }

        totalKept += keptLines.length;
        totalRemoved += removedCount;
        filesProcessed++;
      } catch (err: any) {
        logger.warn(`[LogRotationService] Error processing ${filename}: ${err.message}`);
      }
    }

    if (totalRemoved > 0) {
      logger.info(`[LogRotationService] Auto 24h Cleanup: Purged ${totalRemoved} expired log lines across ${filesProcessed} log files.`);
    }

    return {
      purgedFiles: filesProcessed,
      linesKept: totalKept,
      linesRemoved: totalRemoved
    };
  }

  /**
   * Starts periodic 24-hour log rotation timer (runs hourly)
   */
  public startAutoCleanup(intervalMinutes: number = 60) {
    if (this.timer) {
      clearInterval(this.timer);
    }

    // Run immediate cleanup on startup
    try {
      this.purgeLogsOlderThan(this.retentionHours);
    } catch (e) {
      // ignore
    }

    // Schedule hourly auto-purge
    this.timer = setInterval(() => {
      try {
        this.purgeLogsOlderThan(this.retentionHours);
      } catch (err: any) {
        logger.error(`[LogRotationService] Auto-cleanup job failed: ${err.message}`);
      }
    }, intervalMinutes * 60 * 1000);

    logger.info(`[LogRotationService] 24-Hour Automatic Log Cleanup scheduled (Running every ${intervalMinutes} mins).`);
  }

  public stopAutoCleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const logRotationService = new LogRotationService();
export default logRotationService;
