import { Request, Response, NextFunction } from 'express';
import { CMSDocument, CMSFaq, CMSHelp, CMSBlog, CMSNews, CMSSocial } from '../models/CMS';
import { NotFoundError, BadRequestError } from '../core/errors';
import { saveBase64File } from './UploadController';

export class CMSController {
  // -------------------------------------------------------------
  // 1. LEGAL DOCUMENTS (Privacy, Terms, About Us)
  // -------------------------------------------------------------
  async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      let doc = await CMSDocument.findOne({ type });

      if (!doc) {
        doc = {
          type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
          version: 'v1.0',
          lastUpdated: new Date().toISOString().split('T')[0],
          author: 'Admin',
          status: 'Draft',
          content: ''
        } as any;
      }

      res.status(200).json({ success: true, document: doc });
    } catch (err) {
      next(err);
    }
  }

  async updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.params;
      const { title, version, content, status, author } = req.body;

      const doc = await CMSDocument.findOneAndUpdate(
        { type },
        {
          title,
          version,
          content,
          status: status || 'Published',
          author: author || 'Legal Team',
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        { new: true, upsert: true }
      );

      res.status(200).json({ success: true, message: `Updated ${type} document successfully.`, document: doc });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // 2. FAQs CRUD
  // -------------------------------------------------------------
  async listFaqs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faqs = await CMSFaq.find().sort({ orderIndex: 1, createdAt: -1 });
      res.status(200).json({ success: true, faqs });
    } catch (err) {
      next(err);
    }
  }

  async createFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, answer, category, status } = req.body;
      const faq = await CMSFaq.create({ question, answer, category: category || 'General', status: status || 'Active' });
      res.status(201).json({ success: true, message: 'FAQ created successfully.', faq });
    } catch (err) {
      next(err);
    }
  }

  async updateFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const faq = await CMSFaq.findByIdAndUpdate(id, req.body, { new: true });
      if (!faq) throw new NotFoundError('FAQ not found.');
      res.status(200).json({ success: true, message: 'FAQ updated successfully.', faq });
    } catch (err) {
      next(err);
    }
  }

  async deleteFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CMSFaq.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'FAQ deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // 3. HELP CENTER ARTICLES CRUD
  // -------------------------------------------------------------
  async listHelpArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articles = await CMSHelp.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, articles });
    } catch (err) {
      next(err);
    }
  }

  async createHelpArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, category, summary, content, status } = req.body;
      const slug = (title || 'help-article').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const article = await CMSHelp.create({ title, slug, category: category || 'General', summary, content, status: status || 'Published' });
      res.status(201).json({ success: true, message: 'Help article created.', article });
    } catch (err) {
      next(err);
    }
  }

  async updateHelpArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const article = await CMSHelp.findByIdAndUpdate(id, req.body, { new: true });
      if (!article) throw new NotFoundError('Help article not found.');
      res.status(200).json({ success: true, message: 'Help article updated.', article });
    } catch (err) {
      next(err);
    }
  }

  async deleteHelpArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CMSHelp.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Help article deleted.' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // 4. BLOGS CRUD
  // -------------------------------------------------------------
  async listBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blogs = await CMSBlog.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, blogs });
    } catch (err) {
      next(err);
    }
  }

  async createBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, author, category, coverImage, summary, content, status } = req.body;
      const slug = (title || 'blog-post').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const blog = await CMSBlog.create({ title, slug, author: author || 'Editorial Team', category: category || 'Updates', coverImage, summary, content, status: status || 'Published' });
      res.status(201).json({ success: true, message: 'Blog post created.', blog });
    } catch (err) {
      next(err);
    }
  }

  async updateBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const blog = await CMSBlog.findByIdAndUpdate(id, req.body, { new: true });
      if (!blog) throw new NotFoundError('Blog post not found.');
      res.status(200).json({ success: true, message: 'Blog post updated.', blog });
    } catch (err) {
      next(err);
    }
  }

  async deleteBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CMSBlog.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Blog post deleted.' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // 5. NEWS & MEDIA ANNOUNCEMENTS CRUD
  // -------------------------------------------------------------
  async listNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const news = await CMSNews.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, news });
    } catch (err) {
      next(err);
    }
  }

  async createNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let { headline, badgeTag, priority, publisher, externalUrl, imageUrl, coverImage, videoUrl, summary, content, status } = req.body;
      const mediaImg = imageUrl || coverImage || '';
      const finalImageUrl = mediaImg ? (saveBase64File(mediaImg, 'news', 'banner') || mediaImg) : '';
      const finalVideoUrl = videoUrl ? (saveBase64File(videoUrl, 'news', 'video') || videoUrl) : '';

      const item = await CMSNews.create({
        headline: headline || 'News Announcement',
        badgeTag: badgeTag || 'Update',
        priority: priority || 'Normal',
        publisher: publisher || 'Platform Press',
        externalUrl: externalUrl || '',
        imageUrl: finalImageUrl,
        coverImage: finalImageUrl,
        videoUrl: finalVideoUrl,
        summary: summary || '',
        content: content || summary || '',
        status: status || 'Active'
      });
      res.status(201).json({ success: true, message: 'News announcement created.', news: item });
    } catch (err) {
      next(err);
    }
  }

  async updateNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      const mediaImg = updateData.imageUrl || updateData.coverImage;
      if (mediaImg) {
        const finalImg = saveBase64File(mediaImg, 'news', 'banner') || mediaImg;
        updateData.imageUrl = finalImg;
        updateData.coverImage = finalImg;
      }
      if (updateData.videoUrl) {
        updateData.videoUrl = saveBase64File(updateData.videoUrl, 'news', 'video') || updateData.videoUrl;
      }

      const item = await CMSNews.findByIdAndUpdate(id, updateData, { new: true });
      if (!item) throw new NotFoundError('News item not found.');
      res.status(200).json({ success: true, message: 'News announcement updated.', news: item });
    } catch (err) {
      next(err);
    }
  }

  async deleteNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CMSNews.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'News item deleted.' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // 6. SOCIAL MEDIA LINKS & LOGOS CRUD
  // -------------------------------------------------------------
  async listSocial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const social = await CMSSocial.find().sort({ createdAt: 1 });
      res.status(200).json({ success: true, social });
    } catch (err) {
      next(err);
    }
  }

  async createSocial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let { platform, username, handle, url, link, logoUrl, followerCount, status } = req.body;
      const cleanUrl = url || link || '';
      const cleanHandle = handle || username || '';
      const cleanUsername = username || handle || '';
      const finalLogoUrl = logoUrl ? saveBase64File(logoUrl, 'social', 'logo') : '';

      const social = await CMSSocial.create({
        platform: platform || 'Social',
        username: cleanUsername,
        handle: cleanHandle,
        url: cleanUrl,
        logoUrl: finalLogoUrl || logoUrl || '',
        followerCount: followerCount || '',
        status: status || 'Active'
      });
      res.status(201).json({ success: true, message: 'Social media link added.', social });
    } catch (err) {
      next(err);
    }
  }

  async updateSocial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.url || updateData.link) {
        updateData.url = updateData.url || updateData.link;
      }
      if (updateData.username || updateData.handle) {
        updateData.username = updateData.username || updateData.handle;
        updateData.handle = updateData.handle || updateData.username;
      }
      if (updateData.logoUrl) {
        updateData.logoUrl = saveBase64File(updateData.logoUrl, 'social', 'logo') || updateData.logoUrl;
      }

      const social = await CMSSocial.findByIdAndUpdate(id, updateData, { new: true });
      if (!social) throw new NotFoundError('Social link not found.');
      res.status(200).json({ success: true, message: 'Social media link updated.', social });
    } catch (err) {
      next(err);
    }
  }

  async deleteSocial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CMSSocial.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Social link deleted.' });
    } catch (err) {
      next(err);
    }
  }
}

export const cmsController = new CMSController();
export default cmsController;
