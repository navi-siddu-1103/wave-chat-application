import type { Chat, Message } from '@/lib/types';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { users } from '@/lib/data';

interface ChatPanelProps {
  chat: Chat | null;
  onSendMessage: (newMessage: Message) => void;
  onBack?: () => void;
}

export function ChatPanel({ chat, onSendMessage, onBack }: ChatPanelProps) {
  const handleSendMessage = (content: string) => {
    if (!chat) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: users[0], // 'You'
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onSendMessage(newMessage);
  };

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
      <ChatHeader chat={chat} onBack={onBack} />
      <ChatMessages messages={chat.messages} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
