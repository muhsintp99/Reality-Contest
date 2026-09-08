import mongoose from 'mongoose';
import { CMSDocument, CMSFaq, CMSHelp, CMSBlog, CMSNews, CMSSocial } from '../models/CMS';
import { logger } from '../core/logger';
import { config } from '../config/appConfig';

export async function seedCmsData(): Promise<{ success: boolean; seededCount: Record<string, number> }> {
  const resultCounts = {
    documents: 0,
    faqs: 0,
    helps: 0,
    blogs: 0,
    news: 0,
    socials: 0
  };

  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Seed Legal Documents (Privacy Policy, Terms of Service, About Us)
    const defaultDocuments = [
      {
        type: 'privacy',
        title: 'Platform Privacy Policy & Compliance Standards',
        version: 'v1.2',
        lastUpdated: today,
        author: 'Chief Legal Officer',
        status: 'Published',
        content: `<h2>1. Data Collection & Transparency</h2><p>At Reality Contest Platform (Haka), we collect personal details including full name, email address, mobile number, and government identity documents (PAN, Aadhaar, Passport) strictly required for KYC compliance and tax reporting on cash prize withdrawals.</p><h2>2. Data Usage & Processing</h2><p>Your data is processed to enable contest entries, verify room cycle task proofs, prevent automated bot cheating, and process instant wallet payouts.</p><h2>3. Bank-Grade Security</h2><p>We employ TLS 1.3 encryption for data in transit and AES-256 encryption for data at rest. Identity documents are stored in restricted cloud vaults accessible only to verified compliance officers.</p><h2>4. Your Privacy Rights</h2><p>You may request data inspection, correction, or account deletion by contacting office@realitycontest.in.</p>`
      },
      {
        type: 'terms',
        title: 'Terms of Service & Community Governance',
        version: 'v1.2',
        lastUpdated: today,
        author: 'Legal Operations Team',
        status: 'Published',
        content: `<h2>1. Acceptance of Agreement</h2><p>By creating an account or participating in contests, quizzes, or bi-weekly room cycles on Reality Contest Platform, you agree to comply with all platform rules and fair play guidelines.</p><h2>2. Single Account & Fair Play</h2><p>Each user is permitted exactly one account. Multi-accounting, bot scripts, AI answer tools, or collusion between participants will result in immediate permanent suspension and wallet forfeiture.</p><h2>3. Wallet Payouts & Tax Compliance</h2><p>Cash prizes are deposited to your wallet upon judge score validation. Withdrawals require completed KYC verification in accordance with statutory guidelines.</p>`
      },
      {
        type: 'about',
        title: 'About Reality Contest Platform Ecosystem',
        version: 'v1.0',
        lastUpdated: today,
        author: 'Executive Office',
        status: 'Published',
        content: `<h2>India's Largest Reality Ecosystem</h2><p>Reality Contest Platform is a pioneer in gamified talent competitions, eSports tournaments, and skill-based quizzes. We bridge the gap between aspiring creators, judges, and global brand sponsors.</p><h2>Our Mission</h2><p>Empowering millions of Indian creators to turn their passion into verified income, national recognition, and professional career opportunities.</p>`
      }
    ];

    for (const doc of defaultDocuments) {
      await CMSDocument.findOneAndUpdate(
        { type: doc.type },
        { $set: doc },
        { upsert: true, new: true }
      );
      resultCounts.documents++;
    }

    // 2. Seed FAQs
    const defaultFaqs = [
      {
        question: 'How do I claim my cash contest winnings?',
        answer: 'Cash winnings are automatically credited to your platform wallet once judges finish score validation. You can withdraw cash directly to your bank account or UPI ID after passing KYC verification.',
        category: 'Wallet & Payouts',
        orderIndex: 1,
        status: 'Active'
      },
      {
        question: 'Why is KYC verification required?',
        answer: 'Identity approval (PAN / Aadhaar / Passport) is mandated by financial regulations for real-money prize distributions to prevent fraud, underage gambling, and multi-account abuse.',
        category: 'KYC & Verification',
        orderIndex: 2,
        status: 'Active'
      },
      {
        question: 'How do Bi-Weekly Room Cycles work?',
        answer: 'Room cycles group contestants into cohorts for 14-day talent challenges. Submit media proof (videos/photos) of assigned tasks to earn points and top room leaderboards.',
        category: 'Room Cycles',
        orderIndex: 3,
        status: 'Active'
      },
      {
        question: 'What are Haka Platform Coins 🪙 used for?',
        answer: 'Coins are virtual loyalty tokens earned through daily check-ins, wheel spins, and task submissions. Use Coins to pay contest entry fees or redeem vouchers in the Store.',
        category: 'Rewards & Coins',
        orderIndex: 4,
        status: 'Active'
      },
      {
        question: 'Can I enter multiple contests at the same time?',
        answer: 'Yes! Contestants can participate in multiple daily quizzes, weekly creator cups, and room cycles simultaneously from their dashboard.',
        category: 'Contests & Quizzes',
        orderIndex: 5,
        status: 'Active'
      }
    ];

    for (const faq of defaultFaqs) {
      const exists = await CMSFaq.findOne({ question: faq.question });
      if (!exists) {
        await CMSFaq.create(faq);
        resultCounts.faqs++;
      }
    }

    // 3. Seed Help Center & Support Articles
    const defaultHelps = [
      {
        title: 'Getting Started: Account Setup & First Contest Entry',
        slug: 'getting-started-account-setup',
        category: 'Getting Started',
        summary: 'A step-by-step beginner guide to completing your profile, collecting welcome coins, and entering your first contest.',
        content: '<h2>Step 1: Create Your Account</h2><p>Sign up using your email or mobile phone. Verify your OTP to receive 100 Welcome Bonus Coins instantly.</p><h2>Step 2: Explore the Arena</h2><p>Navigate to the Contests section to browse Daily Quizzes, Creator Cups, and Job Hiring Sprints.</p><h2>Step 3: Submit Your Entry</h2><p>Click "Join Contest", pay the entry fee using Coins or Free Entry, and submit your quiz answers or media proof.</p>',
        views: 1240,
        status: 'Published'
      },
      {
        title: 'KYC Verification Step-by-Step Guide',
        slug: 'kyc-verification-guide',
        category: 'Identity Verification',
        summary: 'Everything you need to know about uploading government ID documents and getting instant verification.',
        content: '<h2>Why KYC is Important</h2><p>KYC approval unlocks direct bank withdrawals for all contest winnings.</p><h2>Documents Accepted</h2><p>We accept PAN Card, Aadhaar Card, Passport, or Voter ID. Upload clear color scans in JPG or PNG format.</p><h2>Processing Time</h2><p>Most KYC applications are reviewed within 2 to 6 hours by our compliance team.</p>',
        views: 980,
        status: 'Published'
      },
      {
        title: 'Wallet Withdrawals & Bank Transfer Payouts',
        slug: 'wallet-withdrawals-payout-guide',
        category: 'Financials',
        summary: 'Learn how to link your UPI ID or bank account and withdraw cash balance seamlessly.',
        content: '<h2>Linking Your Payment Method</h2><p>Go to Settings > Wallet & Payouts and enter your bank account number and IFSC code or VPA (UPI ID).</p><h2>Minimum Withdrawal Amount</h2><p>The minimum withdrawal amount is ₹100. Withdrawals above ₹10,000 are processed via instant NEFT/IMPS.</p>',
        views: 1560,
        status: 'Published'
      }
    ];

    for (const help of defaultHelps) {
      const exists = await CMSHelp.findOne({ slug: help.slug });
      if (!exists) {
        await CMSHelp.create(help);
        resultCounts.helps++;
      }
    }

    // 4. Seed Blogs
    const defaultBlogs = [
      {
        title: 'Announcing the ₹25 Lakhs India Creator Showdown 2026',
        slug: 'india-creator-showdown-2026-announcement',
        author: 'Haka Editorial Team',
        category: 'Major Announcements',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        summary: 'Our annual flagship creator tournament is live with ₹25 Lakhs total cash pool, national television broadcast, and celebrity judge panels.',
        content: '<h2>The Ultimate Talent Stage</h2><p>Reality Contest Platform is proud to launch the 2026 edition of India Creator Showdown. Over 50,000 creators across music, dance, video production, and comedy will compete across 3 knockout rounds.</p><h2>Prizes & Sponsorships</h2><p>The Grand Winner will take home ₹10,00,000 cash, while top 10 finalists secure brand ambassador contracts with Pepsi Co & Zebronics Audio.</p>',
        publishedAt: today,
        status: 'Published'
      },
      {
        title: 'Inside Bi-Weekly Room Cycles: How Cohorts Drive Creator Growth',
        slug: 'inside-bi-weekly-room-cycles',
        author: 'Community Operations',
        category: 'Creator Guides',
        coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        summary: 'Discover how 14-day room cycle cohorts help contestants build discipline, collaborate with peers, and climb national leaderboards.',
        content: '<h2>Why Cohorts Matter</h2><p>Rather than isolated contests, Room Cycles place creators in structured 10-member rooms with weekly task milestones. Leaderboard points accumulate dynamically, granting tier rewards and badges.</p>',
        publishedAt: today,
        status: 'Published'
      }
    ];

    for (const blog of defaultBlogs) {
      const exists = await CMSBlog.findOne({ slug: blog.slug });
      if (!exists) {
        await CMSBlog.create(blog);
        resultCounts.blogs++;
      }
    }

    // 5. Seed News & Media
    const defaultNews = [
      {
        headline: 'Reality Contest Platform Reaches 500,000 Active Contestants',
        badgeTag: 'Milestone',
        priority: 'High',
        publisher: 'TechCrunch India',
        externalUrl: 'https://techcrunch.com',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        summary: 'Haka platform hits milestone 500k registered creators across 28 Indian states, distributing over ₹2.5 Crores in cash rewards.',
        content: 'India\'s fastest growing reality ecosystem has crossed half a million active monthly contestants. The platform continues to scale its bi-weekly room cycle infrastructure.',
        publishedAt: today,
        status: 'Active'
      },
      {
        headline: 'Swiggy & Pepsi Partner with Haka for Brand Creator Cups',
        badgeTag: 'Partnership',
        priority: 'High',
        publisher: 'Economic Times',
        externalUrl: 'https://economictimes.indiatimes.com',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        summary: 'Leading FMCG giants sign multi-year sponsorship deal to host branded challenges and offer exclusive coin store vouchers.',
        content: 'Pepsi Co and Swiggy Gourmet have officially joined Reality Contest Platform as tier-1 brand partners, sponsoring over ₹50 Lakhs in monthly prize pools.',
        publishedAt: today,
        status: 'Active'
      }
    ];

    for (const item of defaultNews) {
      const exists = await CMSNews.findOne({ headline: item.headline });
      if (!exists) {
        await CMSNews.create(item);
        resultCounts.news++;
      }
    }

    // 6. Seed Social Media Links & Logos
    const defaultSocials = [
      {
        platform: 'Instagram',
        username: 'haka_reality_contest',
        handle: '@haka_reality_contest',
        url: 'https://instagram.com/haka_official',
        logoUrl: 'https://cdn.simpleicons.org/instagram/E4405F',
        followerCount: '250,000',
        status: 'Active'
      },
      {
        platform: 'YouTube',
        username: 'HakaRealityChannel',
        handle: '@HakaRealityChannel',
        url: 'https://youtube.com/haka_official',
        logoUrl: 'https://cdn.simpleicons.org/youtube/FF0000',
        followerCount: '180,000',
        status: 'Active'
      },
      {
        platform: 'X / Twitter',
        username: 'HakaContestApp',
        handle: '@HakaContestApp',
        url: 'https://x.com/haka_official',
        logoUrl: 'https://cdn.simpleicons.org/x/000000',
        followerCount: '95,000',
        status: 'Active'
      },
      {
        platform: 'Discord',
        username: 'Haka Gaming Arena',
        handle: 'Haka Community',
        url: 'https://discord.gg/haka',
        logoUrl: 'https://cdn.simpleicons.org/discord/5865F2',
        followerCount: '45,000',
        status: 'Active'
      },
      {
        platform: 'Telegram',
        username: 'Haka Official Updates',
        handle: '@haka_official_news',
        url: 'https://t.me/haka_official',
        logoUrl: 'https://cdn.simpleicons.org/telegram/26A5E4',
        followerCount: '60,000',
        status: 'Active'
      }
    ];

    for (const social of defaultSocials) {
      const exists = await CMSSocial.findOne({ platform: social.platform });
      if (!exists) {
        await CMSSocial.create(social);
        resultCounts.socials++;
      }
    }

    logger.info(`[CMS Seeder] Completed CMS Seeding: ${JSON.stringify(resultCounts)}`);
    return { success: true, seededCount: resultCounts };
  } catch (err: any) {
    logger.error(`[CMS Seeder Error]: ${err.message}`);
    return { success: false, seededCount: resultCounts };
  }
}
