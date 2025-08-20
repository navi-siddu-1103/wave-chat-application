'use server';
/**
 * @fileOverview An AI agent that suggests relevant replies based on the context of a conversation.
 * 
 * - getSmartReplies - A function that suggests replies for a given conversation history.
 * - SmartRepliesInput - The input type for the getSmartReplies function.
 * - SmartRepliesOutput - The return type for the getSmartReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartRepliesInputSchema = z.object({
  chatHistory: z.string().describe('The last few messages in the conversation.'),
});
export type SmartRepliesInput = z.infer<typeof SmartRepliesInputSchema>;

const SmartRepliesOutputSchema = z.object({
  replies: z.array(z.string()).describe('An array of 3 suggested short replies.'),
});
export type SmartRepliesOutput = z.infer<typeof SmartRepliesOutputSchema>;

export async function getSmartReplies(input: SmartRepliesInput): Promise<SmartRepliesOutput> {
  return smartRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartRepliesPrompt',
  input: {schema: SmartRepliesInputSchema},
  output: {schema: SmartRepliesOutputSchema},
  prompt: `You are an AI assistant that suggests short, relevant replies to a chat message based on the conversation history. Generate 3 concise suggestions.

  Given the following conversation history, suggest 3 replies.

  Chat History:
  {{{chatHistory}}}

  Replies: `,
});

const smartRepliesFlow = ai.defineFlow(
  {
    name: 'smartRepliesFlow',
    inputSchema: SmartRepliesInputSchema,
    outputSchema: SmartRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
