'use client';

import { useState } from 'react';
import { Bot, Loader2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Chat } from '@/lib/types';
import { getChatSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
}

export function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary('');
    const chatHistory = chat.messages
      .map((msg) => `${msg.sender.name}: ${msg.content}`)
      .join('\n');
      
    try {
      const result = await getChatSummary(chatHistory);
      setSummary(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate summary.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <Avatar>
          <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.type === 'group' ? 'group symbol' : 'person'} />
          <AvatarFallback>{chat.name.charAt(chat.name.startsWith('#') ? 1 : 0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{chat.name}</h2>
          <p className="text-sm text-muted-foreground">
            {chat.type === 'group' ? `${chat.messages.length} messages` : 'Direct Message'}
          </p>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleSummarize}>
            <Bot className="w-4 h-4 mr-2" />
            Summarize Chat
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat Summary</AlertDialogTitle>
            <AlertDialogDescription>
              An AI-generated summary of the conversation so far.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <p className="text-sm">{summary}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
