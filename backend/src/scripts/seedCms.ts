import { CMSDocument, CMSFaq, CMSSocial } from '../models/CMS';
import { logger } from '../core/logger';

export const DEFAULT_DOCUMENTS = [
  {
    type: 'privacy',
    title: 'Privacy Policy',
    version: 'v1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    author: 'Legal & Compliance Team',
    status: 'Published',
    content: `### 1. Introduction
Welcome to HAKA Reality Contest Platform. We respect your privacy and are committed to protecting your personal data.

### 2. Data We Collect
- Contact details: Full name, verified mobile number, email address.
- Authentication details: Secure OTP logs, encrypted passwords.
- KYC records: Government identity documents, selfie verification.
- Participation data: Contest answers, timestamps, quiz scores, reward points.

### 3. How We Use Data
- To manage user participation in daily, grand, and room tournaments.
- To process wallet earnings, deposits, and withdrawal payouts.
- To maintain fraud prevention, anti-cheat detection, and fair play standards.

### 4. Data Security
We apply industry-standard AES encryption and secure SSL/TLS transmission channels to safeguard your records.`
  },
  {
    type: 'terms',
    title: 'Terms & Conditions',
    version: 'v1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    author: 'Legal Team',
    status: 'Published',
    content: `### 1. Acceptance of Terms
By creating an account or competing in tournaments, you agree to comply with all platform regulations.

### 2. Eligibility
Participants must be at least 18 years old and provide verifiable identity credentials upon winning cash rewards.

### 3. Fair Play Policy
Any use of automated scripts, multiple accounts, or unauthorized collaboration will result in immediate disqualification and wallet forfeiture.

### 4. Withdrawals & Payouts
Prize payouts will be disbursed following verified KYC review and administrative approval within 24 to 48 business hours.`
  },
  {
    type: 'about',
    title: 'About Us',
    version: 'v1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    author: 'HAKA Editorial',
    status: 'Published',
    content: `### Empowering Regional Talent Through Skill-Based Contests
HAKA is a state-of-the-art reality competition platform designed to celebrate knowledge, creativity, culture, and sportsmanship across India and Kerala.

Our mission is to offer transparent, thrilling, and rewarding competitive arenas where every participant has an equal opportunity to excel and win prestigious titles and cash rewards.`
  }
];

export const DEFAULT_FAQS = [
  {
    question: 'How do I join a Daily or Grand Contest?',
    answer: 'Browse the Contest Desk on the mobile app or web platform, review the start schedule and prize pool, and click "Join Contest". For paid entries, ensure your wallet balance is sufficient.',
    category: 'Contests',
    status: 'Active',
    orderIndex: 1
  },
  {
    question: 'How are challenge scores and points calculated?',
    answer: 'Scores depend on speed, accuracy, and task requirements. For quizzes, correct answers award points with slight deductions for incorrect ones. For creative tasks, verified jury review assesses original submissions.',
    category: 'Scoring',
    status: 'Active',
    orderIndex: 2
  },
  {
    question: 'What is the minimum withdrawal limit for cash prizes?',
    answer: 'The minimum withdrawal limit is ₹100. Withdrawals require verified KYC status and are transferred directly to your bank account or UPI ID.',
    category: 'Wallet & Payouts',
    status: 'Active',
    orderIndex: 3
  }
];

export const DEFAULT_SOCIALS = [
  {
    platform: 'Instagram',
    username: '@hakaofficial',
    handle: '@hakaofficial',
    url: 'https://instagram.com/hakaofficial',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
    followerCount: '25K',
    status: 'Active'
  },
  {
    platform: 'YouTube',
    username: 'HAKARealityContests',
    handle: 'HAKARealityContests',
    url: 'https://youtube.com/@hakareality',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    followerCount: '50K',
    status: 'Active'
  },
  {
    platform: 'Facebook',
    username: 'HakaContests',
    handle: 'HakaContests',
    url: 'https://facebook.com/HakaContests',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
    followerCount: '15K',
    status: 'Active'
  }
];

export async function seedCmsData() {
  try {
    // 1. Legal Documents
    for (const doc of DEFAULT_DOCUMENTS) {
      await CMSDocument.findOneAndUpdate(
        { type: doc.type },
        { $setOnInsert: doc },
        { upsert: true, new: true }
      );
    }

    // 2. FAQs
    const faqCount = await CMSFaq.countDocuments();
    if (faqCount === 0) {
      await CMSFaq.insertMany(DEFAULT_FAQS);
    }

    // 3. Social Media Links
    for (const s of DEFAULT_SOCIALS) {
      await CMSSocial.findOneAndUpdate(
        { platform: s.platform },
        { $setOnInsert: s },
        { upsert: true, new: true }
      );
    }

    logger.info('CMS default data verified/seeded successfully.');
    return { success: true, message: 'CMS Seeded successfully' };
  } catch (err: any) {
    logger.error(`Error seeding CMS data: ${err.message}`);
    throw err;
  }
}

export default seedCmsData;
