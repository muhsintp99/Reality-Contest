import mongoose, { Schema, Document } from 'mongoose';

// 1. Legal Document Schema (Privacy Policy, Terms, About Us)
export interface ICMSDocument extends Document {
  type: string; // 'privacy', 'terms', 'about'
  title: string;
  version: string;
  lastUpdated: string;
  author: string;
  status: string; // 'Published', 'Draft'
  content: string;
}

const CMSDocumentSchema: Schema = new Schema(
  {
    type: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    version: { type: String, default: 'v1.0' },
    lastUpdated: { type: String, default: () => new Date().toISOString().split('T')[0] },
    author: { type: String, default: 'Legal Team' },
    status: { type: String, default: 'Published' },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

// 2. FAQ Schema
export interface ICMSFaq extends Document {
  question: string;
  answer: string;
  category: string;
  status: string; // 'Active', 'Hidden'
  orderIndex: number;
}

const CMSFaqSchema: Schema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'General' },
    status: { type: String, default: 'Active' },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 3. Help Center Article Schema
export interface ICMSHelp extends Document {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  views: number;
  status: string; // 'Published', 'Draft'
}

const CMSHelpSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, default: 'General' },
    summary: { type: String, default: '' },
    content: { type: String, required: true },
    views: { type: Number, default: 0 },
    status: { type: String, default: 'Published' }
  },
  { timestamps: true }
);

// 4. Blog Post Schema
export interface ICMSBlog extends Document {
  title: string;
  slug: string;
  author: string;
  category: string;
  coverImage: string;
  summary: string;
  content: string;
  publishedAt: string;
  status: string; // 'Published', 'Draft'
}

const CMSBlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    author: { type: String, default: 'Editorial Team' },
    category: { type: String, default: 'Updates' },
    coverImage: { type: String, default: '' },
    summary: { type: String, default: '' },
    content: { type: String, required: true },
    publishedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, default: 'Published' }
  },
  { timestamps: true }
);

// 5. News & Announcement Schema
export interface ICMSNews extends Document {
  headline: string;
  badgeTag: string;
  priority: string; // 'High', 'Normal'
  summary: string;
  content: string;
  publishedAt: string;
  status: string; // 'Active', 'Archived'
}

const CMSNewsSchema: Schema = new Schema(
  {
    headline: { type: String, required: true },
    badgeTag: { type: String, default: 'Update' },
    priority: { type: String, default: 'Normal' },
    summary: { type: String, default: '' },
    content: { type: String, required: true },
    publishedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: { type: String, default: 'Active' }
  },
  { timestamps: true }
);

// 6. Social Media Link & Logo Schema
export interface ICMSSocial extends Document {
  platform: string;
  handle: string;
  url: string;
  logoUrl: string;
  followerCount: string;
  status: string; // 'Active', 'Disabled'
}

const CMSSocialSchema: Schema = new Schema(
  {
    platform: { type: String, required: true },
    handle: { type: String, required: true },
    url: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    followerCount: { type: String, default: '' },
    status: { type: String, default: 'Active' }
  },
  { timestamps: true }
);

export const CMSDocument = mongoose.model<ICMSDocument>('CMSDocument', CMSDocumentSchema);
export const CMSFaq = mongoose.model<ICMSFaq>('CMSFaq', CMSFaqSchema);
export const CMSHelp = mongoose.model<ICMSHelp>('CMSHelp', CMSHelpSchema);
export const CMSBlog = mongoose.model<ICMSBlog>('CMSBlog', CMSBlogSchema);
export const CMSNews = mongoose.model<ICMSNews>('CMSNews', CMSNewsSchema);
export const CMSSocial = mongoose.model<ICMSSocial>('CMSSocial', CMSSocialSchema);
