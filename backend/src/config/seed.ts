import { User } from '../models/User';
import { Category } from '../models/Category';
import { logger } from '../core/logger';

export async function seedDatabase() {
  try {
    const adminRoles = [
      'Admin',
      'Super Admin',
      'Contest Manager',
      'Finance Manager',
      'Support Manager',
      'Marketing Manager',
      'Content Moderator',
      'KYC Officer',
      'Analytics Manager'
    ];

    const { Admin } = require('../models/Admin');
    const { redisService } = require('../services/RedisService');

    // Clean up stale admin/user cross-collection data
    const deletedAdminsFromUsers = await User.deleteMany({ role: { $in: adminRoles } });
    const deletedUsersFromAdmins = await Admin.deleteMany({ role: { $nin: adminRoles } });
    
    if (deletedAdminsFromUsers.deletedCount > 0 || deletedUsersFromAdmins.deletedCount > 0) {
      logger.info(`Cleaned up stale cross-collection data: deleted ${deletedAdminsFromUsers.deletedCount} admins from users, and ${deletedUsersFromAdmins.deletedCount} users from admins.`);
    }

    // Invalidate stale Redis profiles and sessions cache
    await redisService.invalidatePattern('user:*');
    logger.info('Stale Redis session caches invalidated.');
    // 1. Seed Categories (Only seeds if the category title does not exist to prevent duplication or reference breakages)
    const defaultCategories = [
      { title: 'GK', icon: 'Brain', description: 'General knowledge questions covering historical facts, trivia, science, and world events.' },
      { title: 'Current Affairs', icon: 'Globe', description: 'Latest news, global occurrences, political trends, and dynamic international updates.' },
      { title: 'Sports', icon: 'Trophy', description: 'Athletic achievements, player statistics, historical championships, and rules across world sports.' },
      { title: 'Science', icon: 'Atom', description: 'Physics, chemistry, biology, space exploration, research breakthroughs, and scientific inquiry.' },
      { title: 'Technology', icon: 'Code', description: 'Information systems, digital security, computer languages, and consumer electronics.' },
      { title: 'Movies', icon: 'Film', description: 'Cinema history, Hollywood and regional blockbusters, directors, actors, and awards trivia.' },
      { title: 'Music', icon: 'Music', description: 'Historical genres, dynamic tracks, global pop charts, instruments, and classical symphonies.' },
      { title: 'History', icon: 'BookOpen', description: 'Ancient civilisations, world wars, historical leaders, and timeline milestones.' },
      { name: 'Geography', title: 'Geography', icon: 'Compass', description: 'Topographical maps, flags, countries, capitals, landmarks, and oceanic boundaries.' },
      { title: 'Politics', icon: 'Shield', description: 'Government frameworks, democratic systems, constitution articles, and diplomatic updates.' },
      { title: 'Business', icon: 'Briefcase', description: 'Global commerce, management models, corporate merges, and entrepreneurial leadership.' },
      { title: 'Finance', icon: 'Coins', description: 'Capital markets, cryptocurrency trends, inflation indexes, and accounting rules.' },
      { title: 'Travel', icon: 'Compass', description: 'Wanderlust directories, cultural milestones, geography expeditions, and vacation landmarks.' },
      { title: 'Food', icon: 'Heart', description: 'Global cuisines, culinary techniques, historical recipes, and nutrition metrics.' },
      { title: 'Automobiles', icon: 'Zap', description: 'Supercar specs, internal combustion engines, electric vehicles, and motorsport leagues.' },
      { title: 'Gaming', icon: 'Gamepad2', description: 'Console generations, strategy guides, virtual worlds, and global e-sports tournaments.' },
      { title: 'Artificial Intelligence', icon: 'Brain', description: 'Machine learning algorithms, neural network systems, natural language processing, and robotics.' },
      { title: 'Health', icon: 'HeartPulse', description: 'Human anatomy, diet plans, physical fitness, mental wellbeing, and disease prevention.' },
      { title: 'Space', icon: 'Atom', description: 'Astrophysics, stellar constellations, spacecraft launches, and alien search theories.' },
      { title: 'Nature', icon: 'Leaf', description: 'Ecosystem conservation, animal kingdoms, flora diversity, and climate tracking.' },
      { title: 'Kerala', icon: 'Globe', description: 'Local culture, historical rulers, traditional art forms, geography, and language milestones in God\'s Own Country.' },
      { title: 'India', icon: 'Globe', description: 'National heritage, federal state directories, constitution laws, freedom struggle milestones, and cultural diversity.' },
      { title: 'World', icon: 'Globe', description: 'International organizations, treaties, geopolitical unions, and globally shared historical epochs.' },
      { title: 'Entertainment', icon: 'Tv', description: 'Celebrity news, reality television formats, popular shows, and general media trends.' },
      { title: 'Fashion', icon: 'Palette', description: 'Designer lines, textile histories, couture events, and styling aesthetics.' },
      { title: 'Social Media', icon: 'Video', description: 'Platform algorithms, viral video content creation, internet memes, and influencer markets.' },
      { title: 'Startup', icon: 'Briefcase', description: 'Venture capital strategies, pitch decks, business modeling, and scaling metrics.' },
      { title: 'Cricket', icon: 'Trophy', description: 'Match statistics, historical records, tournament profiles, and pitch layouts.' },
      { title: 'Football', icon: 'Trophy', description: 'European leagues, World Cup archives, club histories, and referee rules.' },
      { title: 'Olympics', icon: 'Trophy', description: 'Summer and winter games registries, historic athletes, medals, and event categories.' },
      { title: 'Mathematics', icon: 'Brain', description: 'Algebra formulas, calculus theories, geometry proofs, and statistics calculations.' },
      { title: 'Logical Reasoning', icon: 'Brain', description: 'Aptitude tests, spatial pattern recognition, syllogisms, and puzzle solving arenas.' }
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ title: cat.title });
      if (!exists) {
        // Generate a basic slug
        const slug = cat.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        await Category.create({
          ...cat,
          slug,
          status: 'Active'
        });
        logger.info(`Seeded default category: ${cat.title}`);
      }
    }

    // 2. Seed Users
    const roles: Array<{
      name: string;
      username: string;
      email: string;
      phone: string;
      role: 'Contestant' | 'Judge' | 'Sponsor' | 'Admin' | 'Super Admin' | 'Contest Manager' | 'Finance Manager' | 'Support Manager' | 'Marketing Manager' | 'Content Moderator' | 'KYC Officer' | 'Analytics Manager' | 'Guest';
    }> = [
      { name: 'Default Contestant', username: 'contestant', email: 'contestant@rcp.com', phone: '+919876543210', role: 'Contestant' },
      { name: 'Default Judge', username: 'judge', email: 'judge@rcp.com', phone: '+919876543211', role: 'Judge' },
      { name: 'Default Sponsor', username: 'sponsor', email: 'sponsor@rcp.com', phone: '+919876543212', role: 'Sponsor' },
      { name: 'Default Admin', username: 'admin', email: 'admin@rcp.com', phone: '+919876543213', role: 'Admin' },
      { name: 'Default Super Admin', username: 'superadmin', email: 'superadmin@rcp.com', phone: '+919876543214', role: 'Super Admin' },
      { name: 'Default Contest Manager', username: 'contestmanager', email: 'contestmanager@rcp.com', phone: '+919876543215', role: 'Contest Manager' },
      { name: 'Default Finance Manager', username: 'financemanager', email: 'financemanager@rcp.com', phone: '+919876543216', role: 'Finance Manager' },
      { name: 'Default Support Manager', username: 'supportmanager', email: 'supportmanager@rcp.com', phone: '+919876543217', role: 'Support Manager' },
      { name: 'Default Marketing Manager', username: 'marketingmanager', email: 'marketingmanager@rcp.com', phone: '+919876543218', role: 'Marketing Manager' },
      { name: 'Default Content Moderator', username: 'contentmoderator', email: 'contentmoderator@rcp.com', phone: '+919876543219', role: 'Content Moderator' },
      { name: 'Default KYC Officer', username: 'kycofficer', email: 'kycofficer@rcp.com', phone: '+919876543220', role: 'KYC Officer' },
      { name: 'Default Analytics Manager', username: 'analyticsmanager', email: 'analyticsmanager@rcp.com', phone: '+919876543221', role: 'Analytics Manager' }
    ];

    for (const r of roles) {
      const { Admin } = require('../models/Admin');
      const modelToUse = adminRoles.includes(r.role) ? Admin : User;
      const exists = await modelToUse.findOne({ email: r.email });
      if (!exists) {
        await modelToUse.create({
          ...r,
          password: 'password123', // Automatically hashed by model pre-save hook
          isEmailVerified: true,
          isPhoneVerified: true,
          kycStatus: 'Approved',
          walletBalance: r.role === 'Contestant' ? 10000 : 0,
          status: 'Active'
        });
        logger.info(`Seeded default account for role [${r.role}]: ${r.email}`);
      }
    }
  } catch (err: any) {
    logger.error(`Database seeding failed: ${err.message}`);
  }
}
export default seedDatabase;

