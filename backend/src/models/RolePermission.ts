import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IModulePermission {
  module: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface IRolePermission extends Document {
  role: string;
  permissions: IModulePermission[];
  createdAt: Date;
  updatedAt: Date;
}

const modulePermissionSchema = new Schema<IModulePermission>({
  module: { type: String, required: true },
  view: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  export: { type: Boolean, default: false }
}, { _id: false });

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    role: { type: String, required: true, unique: true, index: true },
    permissions: [modulePermissionSchema]
  },
  { timestamps: true }
);

export const RolePermission: Model<IRolePermission> =
  mongoose.models.RolePermission || mongoose.model<IRolePermission>('RolePermission', rolePermissionSchema);
export default RolePermission;
