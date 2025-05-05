import { model, Schema } from 'mongoose';
import { doc } from 'prettier';

const doctorSchema = new Schema(
  {
    fullName: {
      type: String,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    special: {
      type: String,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

doctorSchema.virtual('graphs', {
  ref: 'Graph',
  localField: '_id',
  foreignField: 'doctorId'
});

export const Doctor = model('Doctor', doctorSchema);
