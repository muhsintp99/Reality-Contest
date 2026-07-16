import { User } from '../models/User';
import { Category } from '../models/Category';
import { logger } from '../core/logger';

export async function seedDatabase() {
  try {
    // 1. Seed Categories
    const defaultCategories = [
      { title: 'Knowledge', icon: 'Brain', description: 'Quizzes, tech trivia, cognitive tests, and subject expertise challenge arenas.' },
      { title: 'Arts', icon: 'Palette', description: 'Creative expression, drawing, painting, craftsmanship, and performance arts.' },
      { title: 'Content Creation', icon: 'Video', description: 'Vlogging, cinematography, video editing, storytelling, and digital influence.' },
      { title: 'Entrepreneurship', icon: 'Briefcase', description: 'Startup pitches, SaaS models, business strategy, and venture modeling.' },
      { title: 'Sports', icon: 'Trophy', description: 'Athletics, e-sports gaming, physical fitness milestones, and sports analysis.' },
      { title: 'Science', icon: 'Atom', description: 'Scientific experiments, academic research, innovation prototypes, and tech builds.' },
      { title: 'Social Impact', icon: 'Heart', description: 'Eco campaigns, social volunteering, community development, and charity drives.' }
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
      role: 'Contestant' | 'Judge' | 'Sponsor' | 'Admin' | 'Super Admin';
    }> = [
      { name: 'Default Contestant', username: 'contestant', email: 'contestant@rcp.com', phone: '+919876543210', role: 'Contestant' },
      { name: 'Default Judge', username: 'judge', email: 'judge@rcp.com', phone: '+919876543211', role: 'Judge' },
      { name: 'Default Sponsor', username: 'sponsor', email: 'sponsor@rcp.com', phone: '+919876543212', role: 'Sponsor' },
      { name: 'Default Admin', username: 'admin', email: 'admin@rcp.com', phone: '+919876543213', role: 'Admin' },
      { name: 'Default Super Admin', username: 'superadmin', email: 'superadmin@rcp.com', phone: '+919876543214', role: 'Super Admin' }
    ];

    for (const r of roles) {
      const exists = await User.findOne({ email: r.email });
      if (!exists) {
        await User.create({
          ...r,
          password: 'password123', // Automatically hashed by User model pre-save hook
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

