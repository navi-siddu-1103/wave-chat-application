'use client';

import { useState, useRef } from 'react';
import { Bot, Loader2, ArrowLeft, Camera, Upload } from 'lucide-react';
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
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAvatarChange = () => {
    if (previewUrl) {
      onUpdateChatAvatar(chat.id, previewUrl);
      resetAvatarDialog();
    }
  };

  const resetAvatarDialog = () => {
    setNewAvatarFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetAvatarDialog();
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
        <Dialog onOpenChange={handleDialogClose}>
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
                Upload a new photo for {chat.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={previewUrl || chat.avatar} alt="Avatar preview" />
                  <AvatarFallback>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {newAvatarFile ? newAvatarFile.name : 'Choose Image'}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" onClick={handleAvatarChange} disabled={!newAvatarFile}>Save changes</Button>
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
