import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chat } from '@/lib/types';

interface UserListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export function UserList({ chats, selectedChatId, onSelectChat }: UserListProps) {
  const directMessages = chats.filter((chat) => chat.type === 'direct');
  const groupChats = chats.filter((chat) => chat.type === 'group');

  return (
    <aside className="h-full flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary">Wave</h1>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <h2 className="text-xs font-semibold text-muted-foreground p-2 flex items-center">
            <Hash className="w-4 h-4 mr-2" />
            Channels
          </h2>
          {groupChats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className={cn(
                'w-full justify-start items-center p-2 h-12',
                selectedChatId === chat.id && 'bg-accent text-accent-foreground'
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar className="w-8 h-8 mr-2">
                {chat.avatar && <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="group symbol" />}
                <AvatarFallback>{chat.name.charAt(chat.name.startsWith('#') ? 1 : 0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate">{chat.name}</span>
              {chat.unread && chat.unread > 0 ? (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread}
                </span>
              ) : null}
            </Button>
          ))}
        </div>
        <div className="p-2">
          <h2 className="text-xs font-semibold text-muted-foreground p-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Direct Messages
          </h2>
          {directMessages.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className={cn(
                'w-full justify-start items-center p-2 h-12',
                selectedChatId === chat.id && 'bg-accent text-accent-foreground'
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="person" />
                <AvatarFallback>{chat.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate">{chat.name}</span>
               {chat.unread && chat.unread > 0 ? (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread}
                </span>
              ) : null}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
