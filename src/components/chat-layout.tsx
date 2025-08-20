'use client';

import { useState, useEffect } from 'react';
import { chats as initialChats } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { UserList } from './user-list';
import { ChatPanel } from './chat-panel';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function ChatLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(initialChats[0]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setSelectedChat(null);
    } else {
      setSelectedChat(initialChats[0]);
    }
  }, [isMobile]);

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId) || null;
    setSelectedChat(chat);
    // Mark messages as read
    if (chat) {
      const updatedChats = chats.map(c => 
        c.id === chatId ? { ...c, unread: 0 } : c
      );
      setChats(updatedChats);
    }
  };

  const handleSendMessage = (newMessage: Message) => {
    if (selectedChat) {
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, newMessage],
      };
      setSelectedChat(updatedChat);

      const updatedChats = chats.map((chat) =>
        chat.id === selectedChat.id ? updatedChat : chat
      );
      setChats(updatedChats);
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <div className="z-10 border rounded-lg w-full h-full text-sm flex overflow-hidden">
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
        <ChatPanel chat={selectedChat} onSendMessage={handleSendMessage} onBack={isMobile ? handleBack : undefined} />
      </div>
    </div>
  );
}
