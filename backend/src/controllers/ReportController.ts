import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/ReportService';

export class ReportController {
  /**
   * GET /api/admin/reports/summary
   * Platform-wide report summary (Revenue, GST, Contests, Players, Winners, Audit snapshot)
   */
  async getPlatformSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportService.getPlatformReportsSummary(req.query as any);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/reports/contests
   * Unified list of all contests across Standard, Grand, Daily, and Room Cycles with per-contest metrics
   */
  async getContestsReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportService.getPlatformReportsSummary(req.query as any);
      res.status(200).json({
        success: true,
        contests: data.contestsList,
        summary: data.summary
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/reports/contest/:id
   * Deep dive report for an individual contest, including participants, financial breakdown, winners, and audit logs
   */
  async getContestReportDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { type } = req.query;
      const data = await reportService.getContestReport(id, type as string);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/audit-logs
   * Filterable, searchable, paginated audit logs
   */
  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await reportService.getAuditLogs(req.query as any);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/audit-logs
   * Create an audit log record
   */
  async createAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const callerId = (req as any).user?.id || (req as any).user?._id;
      const { action, details, contestId, targetId, severity, module } = req.body;
      
      const log = await reportService.logEvent({
        userId: callerId,
        action: action || 'Manual Admin Action',
        details: details || '',
        contestId,
        targetId,
        severity: severity || 'info',
        module: module || 'Admin',
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Admin Console',
        browser: 'Web Console'
      });

      res.status(201).json({ success: true, message: 'Audit event recorded successfully', log });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/admin/reports/export/:reportType
   * Export report data as CSV
   */
  async exportReportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reportType } = req.params;
      const summaryData = await reportService.getPlatformReportsSummary();

      let csv = '';
      let filename = `platform_report_${reportType}_${Date.now()}.csv`;

      if (reportType === 'revenue' || reportType === 'financial') {
        filename = `revenue_summary_report_${Date.now()}.csv`;
        csv = 'Month,Gross Revenue (INR),GST (18%),Prize Payouts (INR),Contests Held,Active Players\n';
        summaryData.monthlyTrajectory.forEach(m => {
          csv += `"${m.month}",${m.revenue},${m.gst},${m.payouts},${m.contests},${m.players}\n`;
        });
      } else if (reportType === 'gst') {
        filename = `gst_compliance_report_${Date.now()}.csv`;
        csv = 'Metric,Value\n';
        csv += `"GSTIN","${summaryData.gstBreakdown.gstinNumber}"\n`;
        csv += `"Gross Turnover (INR)",${summaryData.gstBreakdown.grossTurnover}\n`;
        csv += `"Taxable Value (INR)",${summaryData.gstBreakdown.taxableValue}\n`;
        csv += `"CGST 9% (INR)",${summaryData.gstBreakdown.cgst}\n`;
        csv += `"SGST 9% (INR)",${summaryData.gstBreakdown.sgst}\n`;
        csv += `"Total GST 18% (INR)",${summaryData.gstBreakdown.totalGst}\n`;
        csv += `"TDS Deducted on Payouts (INR)",${summaryData.gstBreakdown.tdsDeducted}\n`;
        csv += `"Tax Invoices Issued",${summaryData.gstBreakdown.taxInvoicesIssued}\n`;
      } else if (reportType === 'contests' || reportType === 'contest') {
        filename = `contests_performance_report_${Date.now()}.csv`;
        csv = 'Contest ID,Title,Type,Category,Status,Entry Fee (INR),Prize Pool (INR),Registered,Completed,Revenue (INR),GST (INR),Commission (INR)\n';
        summaryData.contestsList.forEach(c => {
          csv += `"${c.contestId}","${c.title}","${c.type}","${c.category}","${c.status}",${c.entryFee},${c.prizePool},${c.registeredParticipants},${c.completedParticipants},${c.grossRevenue},${c.gstCollected},${c.netCommission}\n`;
        });
      } else if (reportType === 'winners' || reportType === 'winner') {
        filename = `winners_distribution_report_${Date.now()}.csv`;
        csv = 'Rank,Winner Name,Contestant ID,Contest Title,Gross Prize (INR),TDS (INR),Net Prize (INR),Status,Date,Transaction Reference\n';
        summaryData.winnerBreakdown.recentWinners.forEach(w => {
          csv += `${w.rank},"${w.name}","${w.contestantId}","${w.contestTitle}",${w.grossPrize},${w.tds},${w.netPrize},"${w.status}","${w.date}","${w.ref}"\n`;
        });
      } else if (reportType === 'players' || reportType === 'player') {
        filename = `players_performance_report_${Date.now()}.csv`;
        csv = 'Name,Contestant ID,Email,Contests Joined,Wins,Total Earnings (INR),Accuracy,KYC Status\n';
        summaryData.playerBreakdown.topContestants.forEach(p => {
          csv += `"${p.name}","${p.contestantId}","${p.email}",${p.contestsJoined},${p.wins},${p.totalEarnings},"${p.accuracy}","${p.kyc}"\n`;
        });
      } else {
        // General summary
        csv = 'Metric,Value\n';
        csv += `"Gross Entry Pool (INR)",${summaryData.summary.grossEntryPool}\n`;
        csv += `"Total GST Collected (INR)",${summaryData.summary.totalGstCollected}\n`;
        csv += `"Total Prize Pool Committed (INR)",${summaryData.summary.totalPrizePools}\n`;
        csv += `"Total Prizes Paid (INR)",${summaryData.summary.totalPrizesPaid}\n`;
        csv += `"Total Net Platform Commission (INR)",${summaryData.summary.totalNetCommission}\n`;
        csv += `"Total Contests",${summaryData.summary.totalContestsCount}\n`;
        csv += `"Active Contests",${summaryData.summary.activeContestsCount}\n`;
        csv += `"Completed Contests",${summaryData.summary.completedContestsCount}\n`;
        csv += `"Total Participants",${summaryData.summary.totalParticipants}\n`;
        csv += `"Total Submissions",${summaryData.summary.totalSubmissionsCount}\n`;
        csv += `"Total Players",${summaryData.summary.totalContestantsCount}\n`;
        csv += `"KYC Approval Rate",${summaryData.summary.kycApprovalRate}\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
export default reportController;
