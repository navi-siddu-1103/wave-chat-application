import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message, Reaction, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { users } from '@/lib/data';
import { MoreHorizontal, Smile, Trash2, Pencil, Check, X, Pin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


interface ChatMessagesProps {
  chatId: string;
  messages: Message[];
  pinnedMessageIds?: string[];
  onUpdateMessage: (chatId: string, messageId: string, newContent: string) => void;
  onDeleteMessage: (chatId: string, messageId: string) => void;
  onAddReaction: (chatId: string, messageId: string, reaction: Reaction) => void;
  onTogglePinMessage: (chatId: string, messageId: string) => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function ChatMessages({ chatId, messages, pinnedMessageIds, onUpdateMessage, onDeleteMessage, onAddReaction, onTogglePinMessage }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleSaveEdit = (messageId: string) => {
    if (editText.trim()) {
      onUpdateMessage(chatId, messageId, editText.trim());
      handleCancelEdit();
    }
  };

  const currentUser = users[0];

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender.id === currentUser.id;
          const isPinned = pinnedMessageIds?.includes(message.id);
          return (
            <div
              key={message.id}
              className={cn('flex items-start gap-3 group', isOwnMessage && 'justify-end')}
            >
              {!isOwnMessage && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} data-ai-hint="person" />
                  <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg relative',
                  isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-card',
                  isPinned ? (isOwnMessage ? 'bg-primary/90' : 'bg-secondary') : ''
                )}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1">{message.sender.name}</p>
                )}
                {editingMessageId === message.id ? (
                  <div className="flex items-center gap-2">
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-8 text-black" autoFocus />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(message.id)}><Check className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <p className="text-sm break-words">{message.content}</p>
                )}

                <div className="flex items-center justify-between mt-1">
                  <p className={cn('text-xs', isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {message.timestamp}
                  </p>
                   {isPinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                </div>


                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onAddReaction(chatId, message.id, { emoji: reaction.emoji, users: [currentUser] })}
                              className={cn(
                                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                                reaction.users.some(u => u.id === currentUser.id)
                                  ? "bg-accent text-accent-foreground border border-accent-foreground/50"
                                  : isOwnMessage
                                    ? "bg-primary/80 border border-primary-foreground/20"
                                    : "bg-secondary border border-border"
                              )}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.users.length}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{reaction.users.map(u => u.id === currentUser.id ? 'You' : u.name).join(', ')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                )}
              </div>
              <div className={cn(
                "self-center opacity-0 group-hover:opacity-100 transition-opacity",
                isOwnMessage ? "order-first -mr-2" : "ml-2"
              )}>
                <MessageActions
                  message={message}
                  isOwnMessage={isOwnMessage}
                  isPinned={isPinned}
                  onEdit={() => handleEditClick(message)}
                  onDelete={() => onDeleteMessage(chatId, message.id)}
                  onReact={(emoji) => onAddReaction(chatId, message.id, { emoji, users: [currentUser] })}
                  onTogglePin={() => onTogglePinMessage(chatId, message.id)}
                />
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

interface MessageActionsProps {
  message: Message;
  isOwnMessage: boolean;
  isPinned?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
  onTogglePin: () => void;
}

function MessageActions({ isOwnMessage, isPinned, onEdit, onDelete, onReact, onTogglePin }: MessageActionsProps) {
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <Smile className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1">
          <div className="flex gap-1">
            {EMOJI_REACTIONS.map(emoji => (
              <Button key={emoji} variant="ghost" size="icon" className="w-8 h-8 text-lg" onClick={() => onReact(emoji)}>
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onTogglePin}><Pin className="w-4 h-4 mr-2" />{isPinned ? 'Unpin' : 'Pin'}</DropdownMenuItem>
          {isOwnMessage && (
            <>
              <DropdownMenuItem onClick={onEdit}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
