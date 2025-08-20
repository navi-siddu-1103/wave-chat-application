'use client';

import { useState } from 'react';
import { Bot, Loader2, ArrowLeft, Camera } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Chat } from '@/lib/types';
import { getChatSummary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface ChatHeaderProps {
  chat: Chat;
  onUpdateChatAvatar: (chatId: string, newAvatar: string) => void;
  onBack?: () => void;
}

export function ChatHeader({ chat, onUpdateChatAvatar, onBack }: ChatHeaderProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
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
  
  const handleAvatarChange = () => {
    if (newAvatarUrl.trim()) {
      onUpdateChatAvatar(chat.id, newAvatarUrl.trim());
      setNewAvatarUrl('');
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
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              <Avatar className="w-10 h-10">
                <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint={chat.type === 'group' ? 'group symbol' : 'person'} />
                <AvatarFallback>{chat.name.charAt(chat.name.startsWith('#') ? 1 : 0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Photo</DialogTitle>
              <DialogDescription>
                Enter a new image URL for {chat.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatar-url" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="avatar-url"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" onClick={handleAvatarChange}>Save changes</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
