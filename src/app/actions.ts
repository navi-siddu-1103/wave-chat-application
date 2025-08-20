'use server';

import { getEmojiSuggestions } from '@/ai/flows/emoji-suggestions';
import { summarizeChat } from '@/ai/flows/chat-summarization';
import { getSmartReplies } from '@/ai/flows/smart-replies';
import type { Message } from '@/lib/types';

export async function suggestEmojis(message: string): Promise<string[]> {
  if (!message || message.trim().length < 3) return [];
  try {
    const result = await getEmojiSuggestions({ message });
    return result.emojis;
  } catch (error) {
    console.error('Error getting emoji suggestions:', error);
    return [];
  }
}

export async function getChatSummary(chatHistory: string): Promise<string> {
  if (!chatHistory) return 'No chat history to summarize.';
  try {
    const result = await summarizeChat({ chatHistory });
    return result.summary;
  } catch (error) {
    console.error('Error getting chat summary:', error);
    return 'Could not generate summary.';
  }
}

export async function suggestReplies(messages: Message[]): Promise<string[]> {
  if (messages.length === 0) return [];
  try {
    const chatHistory = messages
      .slice(-5) // Use last 5 messages for context
      .map((msg) => `${msg.sender.name}: ${msg.content}`)
      .join('\n');
      
    const result = await getSmartReplies({ chatHistory });
    return result.replies;
  } catch (error) {
    console.error('Error getting smart replies:', error);
    return [];
  }
}
