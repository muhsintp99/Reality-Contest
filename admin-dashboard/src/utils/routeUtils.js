/**
 * Utility functions for human-readable routes, title slugification,
 * and intelligent breadcrumb parameter matching.
 */

export const slugifyTitle = (title, fallback = '') => {
  if (!title) return fallback;
  const slug = String(title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse spaces and underscores into single hyphens
    .replace(/^-+|-+$/g, ''); // trim leading and trailing hyphens
  return slug || fallback;
};

export const isIdLike = (segment) => {
  if (!segment) return false;
  const str = String(segment).trim();
  // MongoDB 24-character hex ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(str)) return true;
  // Standard UUID format
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)) return true;
  // Pure numeric IDs
  if (/^\d+$/.test(str)) return true;
  return false;
};

export const humanizeSlug = (slug) => {
  if (!slug) return '';
  if (isIdLike(slug)) return 'Details';
  return slug
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

export const matchesRouteParam = (item, param) => {
  if (!item || !param) return false;
  const rawParam = decodeURIComponent(String(param)).trim().toLowerCase();
  const rawParamSlug = slugifyTitle(rawParam);

  // Match _id or id
  const itemId = String(item._id || item.id || '').toLowerCase();
  if (itemId && (itemId === rawParam || itemId === rawParamSlug)) return true;

  // Match custom string IDs (contestId, roomId, dailyContestId, roomCode)
  const customId = String(
    item.contestId || item.roomId || item.dailyContestId || item.roomCode || item.code || ''
  ).toLowerCase();
  if (customId && (customId === rawParam || customId === rawParamSlug)) return true;

  // Match Title and Title Slug
  const title = String(item.title || item.name || '').toLowerCase();
  const titleSlug = slugifyTitle(title);
  if (title && (title === rawParam || titleSlug === rawParam || titleSlug === rawParamSlug)) return true;

  return false;
};

export const ROUTE_LABEL_MAP = {
  'dashboard': 'Dashboard',
  'grand-contests': 'Grand Contests',
  'grand-contest': 'Grand Contests',
  'bi-weekly-room': 'Bi-Weekly Rooms',
  'bi-weekly-room-cycle': 'Bi-Weekly Rooms',
  'rooms': 'Rooms',
  'tasks': 'Tasks',
  'submissions': 'Submissions',
  'leaderboard': 'Leaderboard',
  'rewards': 'Rewards',
  'analytics': 'Analytics',
  'settings': 'Settings',
  'user-management': 'User Management',
  'all-users': 'All Users',
  'kyc-status': 'KYC Status',
  'wallet-balance': 'Wallet Balance',
  'contest-history': 'Contest History',
  'login-history': 'Login History',
  'device-details': 'Device Details',
  'referral-details': 'Referral Details',
  'question-bank': 'Question Bank',
  'pool': 'Pool',
  'import': 'Import',
  'surveys': 'Surveys',
  'wallet': 'Wallet',
  'coin-management': 'Coins',
  'withdrawals': 'Withdrawals',
  'banners': 'Banners',
  'home': 'Home',
  'popup': 'Popup',
  'festival': 'Festival',
  'sponsored': 'Sponsored',
  'announcement': 'Announcement',
  'referrals': 'Referrals',
  'rules': 'Rules',
  'earnings': 'Earnings',
  'abuse': 'Abuse Detection',
  'reports': 'Reports',
  'cms': 'CMS',
  'privacy': 'Privacy Policy',
  'terms': 'Terms & Conditions',
  'faq': 'FAQ',
  'help': 'Help Center',
  'about': 'About Us',
  'blogs': 'Blogs',
  'news': 'News & Media',
  'social': 'Social Media',
  'advertisements': 'Advertisements',
  'coupons': 'Coupons',
  'promo': 'Promo Codes',
  'discount': 'Discount Entry Fee',
  'free': 'Free Entry',
  'reward': 'Reward Coupon',
  'fraud-detection': 'Fraud Detection',
  'roles-permissions': 'Roles & Permissions',
  'contestants': 'Contestants',
  'judges': 'Judges',
  'sponsors': 'Sponsors',
  'contests': 'Contests',
  'daily-contest': 'Daily Contest',
  'daily-contests': 'Daily Contest',
  'details': 'Details',
  'wizard': 'Wizard',
  'create': 'Create',
  'edit': 'Edit',
  'stages': 'Stages',
  'categories': 'Categories',
  'quiz-builder': 'Quiz Builder',
  'notifications': 'Notifications',
  'myteam': 'My Team'
};
