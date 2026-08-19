import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  categoryId?: string;
  title: string;
  slug: string;
  icon: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    categoryId: { type: String, unique: true, sparse: true, index: true },
    title: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
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
