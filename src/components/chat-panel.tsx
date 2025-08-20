import { useState, useEffect } from 'react';
import type { Chat, Message, Reaction } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ShieldOff } from 'lucide-react';
import { suggestReplies } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';

interface ChatPanelProps {
  chat: Chat | null;
  isBlocked: boolean;
  onSendMessage: (content: string) => void;
  onUpdateMessage: (chatId: string, messageId: string, newContent: string) => void;
  onDeleteMessage: (chatId: string, messageId: string) => void;
  onAddReaction: (chatId: string, messageId: string, reaction: Reaction) => void;
  onUpdateChatAvatar: (chatId: string, newAvatar: string) => void;
  onTogglePinMessage: (chatId: string, messageId: string) => void;
  onBlockUser: (userId: string) => void;
  onBack?: () => void;
}

export function ChatPanel({
  chat,
  isBlocked,
  onSendMessage,
  onUpdateMessage,
  onDeleteMessage,
  onAddReaction,
  onUpdateChatAvatar,
  onTogglePinMessage,
  onBlockUser,
  onBack
}: ChatPanelProps) {
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const { toast } = useToast();
  const currentUser = users[0];

  useEffect(() => {
    setSmartReplies([]);
  }, [chat?.id]);

  const handleGenerateSmartReplies = async () => {
    if (!chat || chat.messages.length === 0) return;
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage.sender.id === currentUser.id) {
        setSmartReplies([]);
        return;
    }

    setIsGeneratingReplies(true);
    setSmartReplies([]);
    try {
      const replies = await suggestReplies(chat.messages);
      setSmartReplies(replies);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate smart replies.',
      });
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const handleSendMessageWithReset = (content: string) => {
    onSendMessage(content);
    setSmartReplies([]);
  }
  
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-muted-foreground">Select a chat to start messaging</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader 
        chat={chat} 
        onUpdateChatAvatar={onUpdateChatAvatar}
        onBlockUser={onBlockUser} 
        onBack={onBack} 
      />
      <ChatMessages
        chatId={chat.id}
        messages={chat.messages}
        pinnedMessageIds={chat.pinnedMessageIds}
        onUpdateMessage={onUpdateMessage}
        onDeleteMessage={onDeleteMessage}
        onAddReaction={onAddReaction}
        onTogglePinMessage={onTogglePinMessage}
      />
      {isBlocked ? (
        <div className="p-4 border-t bg-card text-center text-muted-foreground">
          <ShieldOff className="w-6 h-6 mx-auto mb-2" />
          <p>You have blocked this user. You can't send messages.</p>
        </div>
      ) : (
        <ChatInput 
          onSendMessage={handleSendMessageWithReset} 
          smartReplies={smartReplies}
          onGenerateSmartReplies={handleGenerateSmartReplies}
          isGeneratingReplies={isGeneratingReplies}
        />
      )}
    </div>
  );
}
