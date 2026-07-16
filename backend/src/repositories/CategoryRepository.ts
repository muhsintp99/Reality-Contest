import { BaseRepository } from './BaseRepository';
import { ICategory, Category } from '../models/Category';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }
}
export default CategoryRepository;
