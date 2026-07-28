import { Request, Response } from 'express';

// In-Memory Data Stores for Admin Management Modules
let grandSeasons = [
  { id: 'GS-2026-S1', name: 'Grand Talent Arena 2026', totalStages: 5, eliminationRate: '25%', passMarks: 75, timerSec: 60, status: 'Active', prizePool: '₹10,00,000', createdAt: new Date().toISOString() },
  { id: 'GS-2026-S2', name: 'Summer Idol Auditions', totalStages: 4, eliminationRate: '30%', passMarks: 80, timerSec: 45, status: 'Inactive', prizePool: '₹5,00,000', createdAt: new Date().toISOString() }
];

let questions = [
  { id: 'Q-901', category: 'Logic & Reasoning', difficulty: 'Medium', question: 'If 5 workers complete a wall in 12 days, how long will 6 workers take?', answer: '10 Days', explanation: 'Inversely proportional: (5 * 12) / 6 = 10', negativeMarks: '-0.25', media: 'None', status: 'Active' },
  { id: 'Q-902', category: 'General Knowledge', difficulty: 'Hard', question: 'Identify the historical monument depicted in the video snippet.', answer: 'Hampi Ruins', explanation: 'Located in Vijayanagara, Karnataka.', negativeMarks: '-0.50', media: 'Video', status: 'Active' }
];

let surveys = [
  { id: 'SRV-101', title: 'User Experience & Contest Feedback 2026', targetGroup: 'Active Contestants', responses: 412, reward: '50 Bonus Coins', status: 'Active', schedule: '27 Jul - 10 Aug' },
  { id: 'SRV-102', title: 'New Feature Interest Survey', targetGroup: 'All Registered Users', responses: 1280, reward: 'Free Contest Entry Ticket', status: 'Inactive', schedule: '01 Jul - 20 Jul' }
];

let tasks = [
  { id: 'TSK-501', title: 'Dance Audition Video Upload', type: 'Video Upload', submitter: 'Rahul Kapoor', reviewType: 'AI Review', score: '94/100', aiConfidence: '98.2%', status: 'Active' },
  { id: 'TSK-502', title: 'Creative Costume Design Photo', type: 'Photo Tasks', submitter: 'Sneha Roy', reviewType: 'Manual Review', score: '88/100', aiConfidence: 'N/A', status: 'Active' }
];

let challenges = [
  { id: 'CHL-01', title: 'Lightning Reflexes', category: 'Reaction Game', targetTime: '180ms', plays: '48.2K', difficulty: 'Easy', status: 'Active' },
  { id: 'CHL-02', title: 'Spatial Tile Align', category: 'Puzzle', targetTime: '45s', plays: '32.1K', difficulty: 'Medium', status: 'Active' },
  { id: 'CHL-03', title: 'Number Matrix Deduction', category: 'Logic', targetTime: '60s', plays: '19.4K', difficulty: 'Hard', status: 'Inactive' }
];

let withdrawals = [
  { id: 'WTD-401', user: 'Aarav Sharma', amount: '₹2,500', bank: 'HDFC Bank (A/C: ****4892)', ifsc: 'HDFC0001234', upi: 'aarav@okaxis', status: 'Pending', requestedAt: '2026-07-27 04:12' },
  { id: 'WTD-402', user: 'Priya Nair', amount: '₹1,200', bank: 'ICICI Bank (A/C: ****9102)', ifsc: 'ICIC0005678', upi: 'priya@ybl', status: 'Processing', requestedAt: '2026-07-26 22:30' }
];

let banners = [
  { id: 'BNR-01', title: 'Grand Audition Season 1 Header', type: 'Home Banner', targetUrl: '/contests/grand-2026', impressions: '142.5K', status: 'Active' },
  { id: 'BNR-02', title: 'Diwali Special Contest Popup', type: 'Festival Banner', targetUrl: '/contests/festival-pass', impressions: '89.1K', status: 'Active' }
];

let cmsArticles = [
  { id: 'CMS-01', type: 'privacy', title: 'Privacy Policy Document', content: 'Our Privacy policy outlines data safety standards...', status: 'Active' },
  { id: 'CMS-02', type: 'terms', title: 'Terms & Conditions', content: 'Standard platform rules and compliance terms...', status: 'Active' }
];

let ads = [
  { id: 'AD-101', client: 'RedBull Energy', type: 'Sponsored Contest', budget: '₹2,50,000', impressions: '540.2K', status: 'Active' },
  { id: 'AD-102', client: 'Nike India', type: 'Reward Ads (Watch-to-Earn)', budget: '₹1,00,000', impressions: '210.8K', status: 'Active' }
];

let coupons = [
  { code: 'HAKA50', type: 'Discount Entry Fee', discount: '50% OFF Entry Fee', maxUses: 5000, used: 1420, expires: '2026-08-31', status: 'Active' },
  { code: 'FREEPASS2026', type: 'Free Entry', discount: '100% Free Contest Entry', maxUses: 1000, used: 998, expires: '2026-07-31', status: 'Active' }
];

let fraudLogs = [
  { id: 'FRD-801', user: 'Rohan Mehta (USR-103)', riskScore: '96/100', trigger: 'Multiple Devices (4 IMEIs) & VPN Proxy', location: 'Mumbai, IN', status: 'Active' }
];

export class ModuleManagementController {
  // Generic helper for standard REST endpoints
  private handleList(store: any[], req: Request, res: Response): Response {
    const { search, status } = req.query;
    let result = [...store];
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(item => JSON.stringify(item).toLowerCase().includes(q));
    }
    if (status) {
      result = result.filter(item => item.status === status);
    }
    return res.json({ success: true, count: result.length, data: result });
  }

  // Grand Seasons CRUD
  listGrandSeasons = (req: Request, res: Response): Response => this.handleList(grandSeasons, req, res);
  createGrandSeason = (req: Request, res: Response): Response => {
    const newItem = { id: `GS-${Date.now()}`, ...req.body, status: req.body.status || 'Active', createdAt: new Date().toISOString() };
    grandSeasons.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateGrandSeason = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = grandSeasons.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    grandSeasons[index] = { ...grandSeasons[index], ...req.body };
    return res.json({ success: true, data: grandSeasons[index] });
  };
  deleteGrandSeason = (req: Request, res: Response): Response => {
    const { id } = req.params;
    grandSeasons = grandSeasons.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Season deleted successfully' });
  };
  toggleGrandSeasonStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = grandSeasons.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Season not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Question Bank CRUD
  listQuestions = (req: Request, res: Response): Response => this.handleList(questions, req, res);
  createQuestion = (req: Request, res: Response): Response => {
    const newItem = { id: `Q-${Date.now()}`, ...req.body, status: req.body.status || 'Active' };
    questions.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateQuestion = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = questions.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    questions[index] = { ...questions[index], ...req.body };
    return res.json({ success: true, data: questions[index] });
  };
  deleteQuestion = (req: Request, res: Response): Response => {
    const { id } = req.params;
    questions = questions.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Question deleted' });
  };
  toggleQuestionStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = questions.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Surveys CRUD
  listSurveys = (req: Request, res: Response): Response => this.handleList(surveys, req, res);
  createSurvey = (req: Request, res: Response): Response => {
    const newItem = { id: `SRV-${Date.now()}`, ...req.body, responses: 0, status: req.body.status || 'Active' };
    surveys.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateSurvey = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = surveys.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    surveys[index] = { ...surveys[index], ...req.body };
    return res.json({ success: true, data: surveys[index] });
  };
  deleteSurvey = (req: Request, res: Response): Response => {
    const { id } = req.params;
    surveys = surveys.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Survey deleted' });
  };
  toggleSurveyStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = surveys.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Tasks CRUD
  listTasks = (req: Request, res: Response): Response => this.handleList(tasks, req, res);
  createTask = (req: Request, res: Response): Response => {
    const newItem = { id: `TSK-${Date.now()}`, ...req.body, status: req.body.status || 'Active' };
    tasks.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateTask = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = tasks.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    tasks[index] = { ...tasks[index], ...req.body };
    return res.json({ success: true, data: tasks[index] });
  };
  deleteTask = (req: Request, res: Response): Response => {
    const { id } = req.params;
    tasks = tasks.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Task deleted' });
  };
  toggleTaskStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = tasks.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Challenges CRUD
  listChallenges = (req: Request, res: Response): Response => this.handleList(challenges, req, res);
  createChallenge = (req: Request, res: Response): Response => {
    const newItem = { id: `CHL-${Date.now()}`, ...req.body, plays: '0', status: req.body.status || 'Active' };
    challenges.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateChallenge = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = challenges.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    challenges[index] = { ...challenges[index], ...req.body };
    return res.json({ success: true, data: challenges[index] });
  };
  deleteChallenge = (req: Request, res: Response): Response => {
    const { id } = req.params;
    challenges = challenges.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Challenge deleted' });
  };
  toggleChallengeStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = challenges.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Withdrawals CRUD
  listWithdrawals = (req: Request, res: Response): Response => this.handleList(withdrawals, req, res);
  updateWithdrawalStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const { status } = req.body;
    const item = withdrawals.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }
    item.status = status;
    return res.json({ success: true, data: item });
  };

  // Banners CRUD
  listBanners = (req: Request, res: Response): Response => this.handleList(banners, req, res);
  createBanner = (req: Request, res: Response): Response => {
    const newItem = { id: `BNR-${Date.now()}`, ...req.body, impressions: '0', status: req.body.status || 'Active' };
    banners.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  updateBanner = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const index = banners.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    banners[index] = { ...banners[index], ...req.body };
    return res.json({ success: true, data: banners[index] });
  };
  deleteBanner = (req: Request, res: Response): Response => {
    const { id } = req.params;
    banners = banners.filter(i => i.id !== id);
    return res.json({ success: true, message: 'Banner deleted' });
  };
  toggleBannerStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    const item = banners.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
    return res.json({ success: true, data: item });
  };

  // Advertisements & Coupons CRUD
  listAds = (req: Request, res: Response): Response => this.handleList(ads, req, res);
  createAd = (req: Request, res: Response): Response => {
    const newItem = { id: `AD-${Date.now()}`, ...req.body, impressions: '0', status: 'Active' };
    ads.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };

  listCoupons = (req: Request, res: Response): Response => this.handleList(coupons, req, res);
  createCoupon = (req: Request, res: Response): Response => {
    const newItem = { ...req.body, used: 0, status: 'Active' };
    coupons.unshift(newItem);
    return res.status(201).json({ success: true, data: newItem });
  };
  deleteCoupon = (req: Request, res: Response): Response => {
    const { code } = req.params;
    coupons = coupons.filter(i => i.code !== code);
    return res.json({ success: true, message: 'Coupon deleted' });
  };

  // CMS CRUD
  listCms = (req: Request, res: Response): Response => this.handleList(cmsArticles, req, res);
  updateCms = (req: Request, res: Response): Response => {
    const { type } = req.params;
    let item = cmsArticles.find(i => i.type === type);
    if (!item) {
      item = { id: `CMS-${Date.now()}`, type, title: `${type} Article`, content: req.body.content, status: 'Active' };
      cmsArticles.push(item);
    } else {
      item.content = req.body.content || item.content;
    }
    return res.json({ success: true, data: item });
  };

  // Fraud Logs CRUD
  listFraudLogs = (req: Request, res: Response): Response => this.handleList(fraudLogs, req, res);
}

export const moduleManagementController = new ModuleManagementController();
