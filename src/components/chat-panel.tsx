import type { Chat, Message, Reaction } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ShieldOff } from 'lucide-react';

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
        <ChatInput onSendMessage={onSendMessage} />
      )}
    </div>
  );
}
