import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  slug: string;
  description: string;
  icon: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, required: true, default: 'Layers' },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
export default Category;
