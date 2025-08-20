'use client';

import { useState, useEffect } from 'react';
import { chats as initialChats } from '@/lib/data';
import type { Chat, Message, Reaction, User } from '@/lib/types';
import { UserList } from './user-list';
import { ChatPanel } from './chat-panel';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function ChatLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    if (!isMobile) {
      setSelectedChat(initialChats[0]);
    }
  }, [isMobile]);

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId) || null;
    setSelectedChat(chat);
    if (chat) {
      const updatedChats = chats.map(c => 
        c.id === chatId ? { ...c, unread: 0 } : c
      );
      setChats(updatedChats);
    }
  };

  const handleSendMessage = (content: string) => {
    if (selectedChat) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: users[0],
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [],
      };
      
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
      };
      
      const updatedChats = chats.map(chat => 
        chat.id === selectedChat.id ? updatedChat : chat
      );

      setSelectedChat(updatedChat);
      setChats(updatedChats);
    }
  };

  const handleUpdateMessage = (chatId: string, messageId: string, newContent: string) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, content: newContent } : msg
          )
        };
      }
      return chat;
    }));
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      }) : null);
    }
  };
  
  const handleDeleteMessage = (chatId: string, messageId: string) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId),
          // Also remove from pinned messages if it was pinned
          pinnedMessageIds: chat.pinnedMessageIds?.filter(id => id !== messageId)
        };
      }
      return chat;
    }));
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId),
        pinnedMessageIds: prev.pinnedMessageIds?.filter(id => id !== messageId)
      }) : null);
    }
  };
  
  const handleAddReaction = (chatId: string, messageId: string, reaction: Reaction) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              const existingReactionIndex = msg.reactions?.findIndex(r => r.emoji === reaction.emoji) ?? -1;
              let newReactions = [...(msg.reactions || [])];
              if (existingReactionIndex > -1) {
                const existingReaction = newReactions[existingReactionIndex];
                if (existingReaction.users.some(u => u.id === reaction.users[0].id)) {
                  // User is removing their reaction
                  const updatedUsers = existingReaction.users.filter(u => u.id !== reaction.users[0].id);
                  if (updatedUsers.length === 0) {
                    newReactions.splice(existingReactionIndex, 1);
                  } else {
                    newReactions[existingReactionIndex] = { ...existingReaction, users: updatedUsers };
                  }
                } else {
                  // User is adding to an existing reaction
                  newReactions[existingReactionIndex] = { ...existingReaction, users: [...existingReaction.users, ...reaction.users] };
                }
              } else {
                // New reaction
                newReactions.push(reaction);
              }
              return { ...msg, reactions: newReactions };
            }
            return msg;
          })
        };
      }
      return chat;
    }));

    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? ({
        ...prev,
        messages: prev.messages.map(msg => {
          if (msg.id === messageId) {
            const existingReactionIndex = msg.reactions?.findIndex(r => r.emoji === reaction.emoji) ?? -1;
            let newReactions = [...(msg.reactions || [])];
            if (existingReactionIndex > -1) {
                const existingReaction = newReactions[existingReactionIndex];
                if (existingReaction.users.some(u => u.id === reaction.users[0].id)) {
                  const updatedUsers = existingReaction.users.filter(u => u.id !== reaction.users[0].id);
                  if (updatedUsers.length === 0) {
                    newReactions.splice(existingReactionIndex, 1);
                  } else {
                    newReactions[existingReactionIndex] = { ...existingReaction, users: updatedUsers };
                  }
                } else {
                  newReactions[existingReactionIndex] = { ...existingReaction, users: [...existingReaction.users, ...reaction.users] };
                }
              } else {
                newReactions.push(reaction);
              }
            return { ...msg, reactions: newReactions };
          }
          return msg;
        })
      }) : null);
    }
  };

  const handleUpdateChatAvatar = (chatId: string, newAvatar: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, avatar: newAvatar };
      }
      return chat;
    });
    setChats(updatedChats);
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? { ...prev, avatar: newAvatar } : null);
    }
  };

  const handleAddContact = (newUser: User) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      type: 'direct',
      name: newUser.name,
      participants: [users[0], newUser],
      avatar: newUser.avatar,
      messages: [],
    };
    setChats(prevChats => [...prevChats, newChat]);
    setSelectedChat(newChat);
  };

  const handleAddGroup = (group: { name: string; avatar?: string }) => {
    const newGroupChat: Chat = {
      id: `chat-${Date.now()}`,
      type: 'group',
      name: group.name,
      avatar: group.avatar,
      messages: [],
    };
    setChats(prevChats => [...prevChats, newGroupChat]);
    setSelectedChat(newGroupChat);
  };

  const handleTogglePinMessage = (chatId: string, messageId: string) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        const pinnedIds = chat.pinnedMessageIds || [];
        const newPinnedIds = pinnedIds.includes(messageId)
          ? pinnedIds.filter(id => id !== messageId)
          : [...pinnedIds, messageId];
        return { ...chat, pinnedMessageIds: newPinnedIds };
      }
      return chat;
    }));

    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => {
        if (!prev) return null;
        const pinnedIds = prev.pinnedMessageIds || [];
        const newPinnedIds = pinnedIds.includes(messageId)
          ? pinnedIds.filter(id => id !== messageId)
          : [...pinnedIds, messageId];
        return { ...prev, pinnedMessageIds: newPinnedIds };
      });
    }
  };

  const handleBlockUser = (userId: string) => {
    setBlockedUserIds(prev => [...prev, userId]);
    const user = users.find(u => u.id === userId);
    toast({
      title: 'User Blocked',
      description: `You have blocked ${user?.name || 'the user'}.`,
    });
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const currentUser = users[0];
  const participant = selectedChat?.type === 'direct' ? selectedChat.participants?.find(p => p.id !== currentUser.id) : undefined;
  const isBlocked = participant ? blockedUserIds.includes(participant.id) : false;

  return (
    <div className="z-10 border rounded-lg w-full h-full text-sm flex overflow-hidden shadow-lg">
       <div className={cn(
        "border-r",
        "w-full lg:w-80",
        isMobile && selectedChat ? "hidden" : "flex flex-col"
      )}>
        <UserList 
          chats={chats} 
          onSelectChat={handleSelectChat} 
          selectedChatId={selectedChat?.id}
          onAddContact={handleAddContact}
          onAddGroup={handleAddGroup}
        />
      </div>
      <div className={cn(
        "flex-1",
        isMobile && !selectedChat ? "hidden" : "flex flex-col"
      )}>
        <ChatPanel 
          chat={selectedChat} 
          onSendMessage={handleSendMessage} 
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          onAddReaction={handleAddReaction}
          onUpdateChatAvatar={handleUpdateChatAvatar}
          onTogglePinMessage={handleTogglePinMessage}
          onBlockUser={handleBlockUser}
          isBlocked={isBlocked}
          onBack={isMobile ? handleBack : undefined} 
        />
      </div>
    </div>
  );
}
