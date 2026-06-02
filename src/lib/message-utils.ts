/**
 * Utilities for message read status and typing indicators
 */

import { Message, Chat } from '@/models/Chat';
import { Notification } from '@/models/Notification';
import mongoose from 'mongoose';
import { logger } from './logger';

/**
 * Mark message as read by a user
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<boolean> {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      logger.warn('Message not found for read status', { messageId });
      return false;
    }

    // Check if user has already read the message
    const alreadyRead = message.readBy?.some(
      (read) => read.userId.toString() === userId
    );

    if (!alreadyRead) {
      // Add user to readBy array
      if (!message.readBy) {
        message.readBy = [];
      }
      message.readBy.push({
        userId: new mongoose.Types.ObjectId(userId),
        readAt: new Date(),
      });
      await message.save();
      logger.debug('Message marked as read', { messageId, userId });
    }

    return true;
  } catch (error) {
    logger.error('Error marking message as read', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Mark all messages in a chat as read
 */
export async function markChatAsRead(
  chatId: string,
  userId: string
): Promise<number> {
  try {
    const result = await Message.updateMany(
      {
        chatId: new mongoose.Types.ObjectId(chatId),
        'readBy.userId': { $ne: new mongoose.Types.ObjectId(userId) },
      },
      {
        $push: {
          readBy: {
            userId: new mongoose.Types.ObjectId(userId),
            readAt: new Date(),
          },
        },
      }
    );

    logger.info('Chat marked as read', {
      chatId,
      userId,
      modifiedCount: result.modifiedCount,
    });

    return result.modifiedCount;
  } catch (error) {
    logger.error('Error marking chat as read', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}

/**
 * Get read status for a message (how many users have read it)
 */
export async function getMessageReadStatus(
  messageId: string
): Promise<{ totalRead: number; readBy: Array<{ userId: string; readAt: Date }> } | null> {
  try {
    const message = await Message.findById(messageId).select('readBy');
    if (!message) {
      return null;
    }

    return {
      totalRead: message.readBy?.length || 0,
      readBy: message.readBy?.map((read) => ({
        userId: read.userId.toString(),
        readAt: read.readAt,
      })) || [],
    };
  } catch (error) {
    logger.error('Error getting message read status', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Add user to typing list
 */
export async function addTypingUser(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $addToSet: { typingUsers: new mongoose.Types.ObjectId(userId) },
      },
      { new: true }
    );

    if (chat) {
      logger.debug('User added to typing list', { chatId, userId });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error adding typing user', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Remove user from typing list
 */
export async function removeTypingUser(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { typingUsers: new mongoose.Types.ObjectId(userId) },
      },
      { new: true }
    );

    if (chat) {
      logger.debug('User removed from typing list', { chatId, userId });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error removing typing user', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Get list of users currently typing in a chat
 */
export async function getTypingUsers(chatId: string): Promise<string[]> {
  try {
    const chat = await Chat.findById(chatId).select('typingUsers');
    if (!chat) {
      return [];
    }

    return chat.typingUsers?.map((id) => id.toString()) || [];
  } catch (error) {
    logger.error('Error getting typing users', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Clear typing users for a chat (used for cleanup)
 */
export async function clearTypingUsers(chatId: string): Promise<boolean> {
  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { typingUsers: [] },
      { new: true }
    );

    if (chat) {
      logger.debug('Typing users cleared', { chatId });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error clearing typing users', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Create notification for user
 */
export async function createNotification(
  userId: string,
  type: 'message' | 'mention' | 'reaction' | 'call' | 'contact_request',
  title: string,
  body: string,
  data?: Record<string, any>,
  senderId?: string
): Promise<any> {
  try {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
      senderId: senderId ? new mongoose.Types.ObjectId(senderId) : undefined,
      type,
      title,
      body,
      data,
      read: false,
    });

    await notification.save();
    logger.info('Notification created', {
      userId,
      type,
      notificationId: notification._id,
    });

    return notification;
  } catch (error) {
    logger.error('Error creating notification', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    const result = await Notification.findByIdAndUpdate(
      notificationId,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (result) {
      logger.debug('Notification marked as read', { notificationId });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error marking notification as read', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(userId: string): Promise<any[]> {
  try {
    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications;
  } catch (error) {
    logger.error('Error getting unread notifications', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}
