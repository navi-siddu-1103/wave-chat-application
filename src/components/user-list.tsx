import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Hash, UserPlus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Chat, User } from '@/lib/types';
import { AddContactDialog } from './add-contact-dialog';
import { AddGroupDialog } from './add-group-dialog';
import { users } from '@/lib/data';

interface UserListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onAddContact: (user: User) => void;
  onAddGroup: (group: { name: string; avatar?: string }) => void;
}

export function UserList({ chats, selectedChatId, onSelectChat, onAddContact, onAddGroup }: UserListProps) {
  const directMessages = chats.filter((chat) => chat.type === 'direct');
  const groupChats = chats.filter((chat) => chat.type === 'group');
  const currentUser = users[0];

  const getParticipant = (chat: Chat) => {
    if (chat.type === 'direct' && chat.participants) {
      return chat.participants.find(p => p.id !== currentUser.id);
    }
    return undefined;
  };

  return (
    <aside className="h-full flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary">Wave</h1>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground p-2 flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              Channels
            </h2>
            <AddGroupDialog onAddGroup={onAddGroup}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="w-4 h-4" />
                <span className="sr-only">Create Group</span>
              </Button>
            </AddGroupDialog>
          </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground p-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Direct Messages
            </h2>
            <AddContactDialog onAddContact={onAddContact}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <UserPlus className="w-4 h-4" />
                <span className="sr-only">Add Contact</span>
              </Button>
            </AddContactDialog>
          </div>
          {directMessages.map((chat) => {
            const participant = getParticipant(chat);
            return (
              <Button
                key={chat.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start items-center p-2 h-12',
                  selectedChatId === chat.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src={chat.avatar} alt={chat.name} data-ai-hint="person" />
                    <AvatarFallback>{chat.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {participant?.online && (
                    <span className="absolute bottom-0 right-2 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>
                <span className="truncate">{chat.name}</span>
                 {chat.unread && chat.unread > 0 ? (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
