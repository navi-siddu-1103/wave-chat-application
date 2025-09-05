import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  content: string;
  sender: mongoose.Types.ObjectId; // User ID
  chatId: mongoose.Types.ObjectId;
  messageType: 'text' | 'image' | 'file';
  reactions: {
    emoji: string;
    users: mongoose.Types.ObjectId[]; // Array of user IDs
  }[];
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: mongoose.Types.ObjectId; // Message ID if replying
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends Document {
  _id: string;
  type: 'direct' | 'group';
  name: string;
  description?: string;
  avatar?: string;
  participants: mongoose.Types.ObjectId[]; // Array of user IDs
  admins: mongoose.Types.ObjectId[]; // Array of user IDs (for groups)
  lastMessage?: mongoose.Types.ObjectId; // Message ID
  lastActivity: Date;
  pinnedMessages: mongoose.Types.ObjectId[]; // Array of message IDs
  createdBy: mongoose.Types.ObjectId; // User ID
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  reactions: [{
    emoji: String,
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true,
});

const ChatSchema = new Schema<IChat>({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  avatar: {
    type: String,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  pinnedMessages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastActivity: -1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
