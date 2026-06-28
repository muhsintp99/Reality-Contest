import { Document, Model, FilterQuery, UpdateQuery, QueryOptions, ClientSession } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  create(item: Partial<T> | any, session?: ClientSession): Promise<T>;
  findById(id: string, projection?: any, options?: QueryOptions): Promise<T | null>;
  findOne(filter: FilterQuery<T>, projection?: any, options?: QueryOptions): Promise<T | null>;
  find(filter: FilterQuery<T>, projection?: any, options?: QueryOptions): Promise<T[]>;
  update(id: string, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<any>;
  delete(id: string, options?: QueryOptions): Promise<T | null>;
  deleteMany(filter: FilterQuery<T>, options?: QueryOptions): Promise<any>;
  countDocuments(filter: FilterQuery<T>): Promise<number>;
}

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(item: Partial<T> | any, session?: ClientSession): Promise<T> {
    const doc = new this.model(item);
    if (session) {
      return doc.save({ session }) as Promise<T>;
    }
    return doc.save() as Promise<T>;
  }

  async findById(id: string, projection?: any, options?: QueryOptions): Promise<T | null> {
    return this.model.findById(id, projection, options).exec();
  }

  async findOne(filter: FilterQuery<T>, projection?: any, options?: QueryOptions): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  async find(filter: FilterQuery<T>, projection?: any, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  async update(id: string, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, ...options }).exec();
  }

  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<any> {
    return (this.model as any).updateMany(filter, update, options).exec();
  }

  async delete(id: string, options?: QueryOptions): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options).exec();
  }

  async deleteMany(filter: FilterQuery<T>, options?: QueryOptions): Promise<any> {
    return (this.model as any).deleteMany(filter, options).exec();
  }

  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
export default BaseRepository;
