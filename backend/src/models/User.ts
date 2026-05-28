import mongoose from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  schoolName?: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  schoolName: {
    type: String,
    trim: true,
  },
  profileImageUrl: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
