'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { suggestEmojis } from '@/app/actions';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (message.trim().length > 2) {
      setIsLoading(true);
      timeoutRef.current = setTimeout(async () => {
        const result = await suggestEmojis(message);
        setSuggestions(result);
        setIsLoading(false);
      }, 500); // Debounce
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestionClick = (emoji: string) => {
    setMessage(prev => `${prev} ${emoji} `);
  };

  return (
    <div className="p-4 border-t bg-card">
      { (isLoading || suggestions.length > 0) && (
        <div className="flex items-center gap-2 mb-2">
           {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {!isLoading && suggestions.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(emoji)}
              className="p-1 text-xl rounded-md hover:bg-secondary transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-24"
        />
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Smile className="h-5 w-5" />
          </Button>
          <Button size="sm" onClick={handleSend} disabled={!message.trim()}>
            Send <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
