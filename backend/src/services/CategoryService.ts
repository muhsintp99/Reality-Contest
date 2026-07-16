import { CategoryRepository } from '../repositories/CategoryRepository';
import { ICategory } from '../models/Category';
import { BadRequestError, NotFoundError } from '../core/errors';

export class CategoryService {
  private categoryRepo = new CategoryRepository();

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
  }

  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    if (!data.title || !data.icon) {
      throw new BadRequestError('Title and icon are required.');
    }

    const existing = await this.categoryRepo.findOne({ title: data.title });
    if (existing) {
      throw new BadRequestError('A category with this title already exists.');
    }

    const slug = this.slugify(data.title);
    const existingSlug = await this.categoryRepo.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestError('A category with a similar title (slug collision) already exists.');
    }

    const categoryData = {
      ...data,
      slug
    };

    return this.categoryRepo.create(categoryData);
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found.');
    }
    return category;
  }

  async listCategories(filter: any = {}): Promise<ICategory[]> {
    return this.categoryRepo.find(filter, null, { sort: { title: 1 } });
  }

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const category = await this.getCategoryById(id);

    if (data.title && data.title !== category.title) {
      const existing = await this.categoryRepo.findOne({ title: data.title });
      if (existing) {
        throw new BadRequestError('A category with this title already exists.');
      }
      data.slug = this.slugify(data.title);
      const existingSlug = await this.categoryRepo.findOne({ slug: data.slug });
      if (existingSlug) {
        throw new BadRequestError('A category with a similar title (slug collision) already exists.');
      }
    }

    const updated = await this.categoryRepo.update(id, data);
    if (!updated) {
      throw new NotFoundError('Category not found for update.');
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<ICategory> {
    await this.getCategoryById(id);
    const deleted = await this.categoryRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Category not found for deletion.');
    }
    return deleted;
  }
}

export const categoryService = new CategoryService();
export default categoryService;
