import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { users } from '@/lib/data';

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender.id === users[0].id;
          return (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 animate-in fade-in-20 slide-in-from-bottom-4 duration-300',
                isOwnMessage && 'justify-end'
              )}
            >
              {!isOwnMessage && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} data-ai-hint="person" />
                  <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg',
                  isOwnMessage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                )}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1">{message.sender.name}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={cn('text-xs mt-1', isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                  {message.timestamp}
                </p>
              </div>
              {isOwnMessage && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} data-ai-hint="person" />
                  <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
