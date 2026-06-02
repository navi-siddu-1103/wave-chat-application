/**
 * Input validation schemas using Zod
 */

import { z } from 'zod';

// Phone number validation
export const phoneNumberSchema = z
  .string()
  .min(7, 'Phone number must be at least 7 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^[\d+\-() ]+$/, 'Phone number contains invalid characters');

// Auth schemas
export const registerSchema = z.object({
  phoneNumber: phoneNumberSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
});

export const loginSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export const verifySchema = z.object({
  phoneNumber: phoneNumberSchema,
  verificationCode: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only digits'),
  userId: z.string().optional(),
});

// Chat schemas
export const createChatSchema = z.object({
  type: z.enum(['direct', 'group']),
  name: z
    .string()
    .min(1, 'Chat name is required')
    .max(100, 'Chat name must be 100 characters or less'),
  participants: z
    .array(z.string())
    .min(1, 'At least one participant is required'),
  description: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(5000, 'Message must be 5000 characters or less'),
  chatId: z.string(),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
  replyTo: z.string().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

// Contact management schemas
export const addContactSchema = z.object({
  contactId: z.string(),
});

export const blockUserSchema = z.object({
  userId: z.string(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
});

// Type exports for convenience
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AddContactInput = z.infer<typeof addContactSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Validate request data against schema
 */
export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(err.message);
      });
      throw new Error(JSON.stringify(details));
    }
    throw error;
  }
}
