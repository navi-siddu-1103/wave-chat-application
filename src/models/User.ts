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
  lastSeenAt?: Date; // New: More explicit last activity timestamp
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
  lastSeenAt: {
    type: Date,
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
UserSchema.index({ online: 1 });
UserSchema.index({ lastSeen: -1 });
UserSchema.index({ contacts: 1 });
UserSchema.index({ blockedUsers: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
