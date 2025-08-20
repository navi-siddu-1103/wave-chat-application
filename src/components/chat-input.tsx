'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { suggestEmojis } from '@/app/actions';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  smartReplies?: string[];
  onGenerateSmartReplies?: () => void;
  isGeneratingReplies?: boolean;
}

export function ChatInput({ 
  onSendMessage,
  smartReplies = [],
  onGenerateSmartReplies,
  isGeneratingReplies = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [emojiSuggestions, setEmojiSuggestions] = useState<string[]>([]);
  const [isSuggestingEmojis, setIsSuggestingEmojis] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (message.trim().length > 2) {
      setIsSuggestingEmojis(true);
      timeoutRef.current = setTimeout(async () => {
        const result = await suggestEmojis(message);
        setEmojiSuggestions(result);
        setIsSuggestingEmojis(false);
      }, 500); // Debounce
    } else {
      setEmojiSuggestions([]);
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
      setEmojiSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };
  
  const handleEmojiSuggestionClick = (emoji: string) => {
    setMessage(prev => `${prev} ${emoji} `);
  };

  return (
    <div className="p-4 border-t bg-card">
      { (isGeneratingReplies || smartReplies.length > 0) && (
        <div className="flex items-center gap-2 mb-2">
           {isGeneratingReplies && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {!isGeneratingReplies && smartReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(reply)}
              className="h-auto text-xs py-1 px-2"
            >
              {reply}
            </Button>
          ))}
        </div>
      )}
       { (isSuggestingEmojis || emojiSuggestions.length > 0) && (
        <div className="flex items-center gap-2 mb-2">
           {isSuggestingEmojis && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {!isSuggestingEmojis && emojiSuggestions.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiSuggestionClick(emoji)}
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
          className="pr-32"
        />
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center gap-1">
          {onGenerateSmartReplies && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onGenerateSmartReplies} disabled={isGeneratingReplies}>
              <Sparkles className="h-5 w-5" />
            </Button>
          )}
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
