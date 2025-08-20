'use server';
/**
 * @fileOverview An AI agent that suggests relevant emojis based on the context of a message.
 * 
 * - getEmojiSuggestions - A function that suggests emojis for a given message.
 * - EmojiSuggestionsInput - The input type for the getEmojiSuggestions function.
 * - EmojiSuggestionsOutput - The return type for the getEmojiSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmojiSuggestionsInputSchema = z.object({
  message: z.string().describe('The message to suggest emojis for.'),
});
export type EmojiSuggestionsInput = z.infer<typeof EmojiSuggestionsInputSchema>;

const EmojiSuggestionsOutputSchema = z.object({
  emojis: z.array(z.string()).describe('An array of suggested emojis.'),
});
export type EmojiSuggestionsOutput = z.infer<typeof EmojiSuggestionsOutputSchema>;

export async function getEmojiSuggestions(input: EmojiSuggestionsInput): Promise<EmojiSuggestionsOutput> {
  return emojiSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emojiSuggestionsPrompt',
  input: {schema: EmojiSuggestionsInputSchema},
  output: {schema: EmojiSuggestionsOutputSchema},
  prompt: `You are an AI assistant that suggests relevant emojis for a given message.

  Given the following message, suggest up to 5 relevant emojis.

  Message: {{{message}}}

  Emojis: `,
});

const emojiSuggestionsFlow = ai.defineFlow(
  {
    name: 'emojiSuggestionsFlow',
    inputSchema: EmojiSuggestionsInputSchema,
    outputSchema: EmojiSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
