import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId; // Recipient
  senderId?: mongoose.Types.ObjectId; // Sender (if applicable)
  type: 'message' | 'mention' | 'reaction' | 'call' | 'contact_request';
  title: string;
  body: string;
  data?: {
    chatId?: string;
    messageId?: string;
    senderId?: string;
    [key: string]: any;
  };
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedia extends Document {
  _id: string;
  messageId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string; // Cloud storage URL or local path
  mimeType: string;
  size: number;
  width?: number; // For images/videos
  height?: number; // For images/videos
  duration?: number; // For audio/video in seconds
  thumbnail?: string; // URL to thumbnail
  metadata?: {
    name?: string;
    description?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['message', 'mention', 'reaction', 'call', 'contact_request'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const MediaSchema = new Schema<IMedia>({
  messageId: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'file'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ senderId: 1 });
NotificationSchema.index({ type: 1 });

MediaSchema.index({ messageId: 1 });
MediaSchema.index({ userId: 1 });
MediaSchema.index({ chatId: 1 });
MediaSchema.index({ type: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', NotificationSchema);
export const Media = mongoose.models.Media || 
  mongoose.model<IMedia>('Media', MediaSchema);
