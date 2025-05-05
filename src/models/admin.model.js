import { model, Schema } from 'mongoose';

const adminSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      default: 'admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin = model('Admin', adminSchema);
