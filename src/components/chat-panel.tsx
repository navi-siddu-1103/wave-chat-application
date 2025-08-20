import type { Chat, Message, Reaction } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';

interface ChatPanelProps {
  chat: Chat | null;
  onSendMessage: (content: string) => void;
  onUpdateMessage: (chatId: string, messageId: string, newContent: string) => void;
  onDeleteMessage: (chatId: string, messageId: string) => void;
  onAddReaction: (chatId: string, messageId: string, reaction: Reaction) => void;
  onUpdateChatAvatar: (chatId: string, newAvatar: string) => void;
  onTogglePinMessage: (chatId: string, messageId: string) => void;
  onBack?: () => void;
}

export function ChatPanel({
  chat,
  onSendMessage,
  onUpdateMessage,
  onDeleteMessage,
  onAddReaction,
  onUpdateChatAvatar,
  onTogglePinMessage,
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
      <ChatHeader chat={chat} onUpdateChatAvatar={onUpdateChatAvatar} onBack={onBack} />
      <ChatMessages
        chatId={chat.id}
        messages={chat.messages}
        pinnedMessageIds={chat.pinnedMessageIds}
        onUpdateMessage={onUpdateMessage}
        onDeleteMessage={onDeleteMessage}
        onAddReaction={onAddReaction}
        onTogglePinMessage={onTogglePinMessage}
      />
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
