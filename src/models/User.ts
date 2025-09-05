import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  phoneNumber: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  online: boolean;
  lastSeen: Date;
  contacts: string[]; // Array of user IDs
  blockedUsers: string[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationExpires: {
    type: Date,
  },
  online: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  contacts: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Index for faster queries
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ isVerified: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
