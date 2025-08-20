'use client';

import { useState, useEffect } from 'react';
import { chats as initialChats } from '@/lib/data';
import type { Chat, Message, Reaction } from '@/lib/types';
import { UserList } from './user-list';
import { ChatPanel } from './chat-panel';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { users } from '@/lib/data';

export function ChatLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const isMobile = useIsMobile();

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
          messages: chat.messages.filter(msg => msg.id !== messageId)
        };
      }
      return chat;
    }));
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId)
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

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <div className="z-10 border rounded-lg w-full h-full text-sm flex overflow-hidden shadow-lg">
       <div className={cn(
        "border-r",
        "w-full lg:w-80",
        isMobile && selectedChat ? "hidden" : "flex flex-col"
      )}>
        <UserList chats={chats} onSelectChat={handleSelectChat} selectedChatId={selectedChat?.id} />
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
          onBack={isMobile ? handleBack : undefined} 
        />
      </div>
    </div>
  );
}
