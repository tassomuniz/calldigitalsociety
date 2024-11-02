"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  role: string;
  text: string;
  timestamp?: string;
  isFinal?: boolean;
}

interface TranscriberProps {
  conversation: Message[];
}

export function Transcriber({ conversation }: TranscriberProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <div className="flex flex-col h-[600px] md:h-full w-full max-w-full mx-auto bg-background rounded-lg shadow-lg overflow-hidden dark:bg-background">
      <div className="bg-secondary px-4 py-3 flex items-center justify-between dark:bg-secondary">
        <div className="font-medium text-foreground dark:text-foreground">Transcrição ao Vivo</div>
        <div className="text-sm text-muted-foreground">
          {conversation.length > 0 ? `${conversation.length} mensagens` : 'Aguardando...'}
        </div>
      </div>
      
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {conversation.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''} 
                       ${!message.isFinal ? 'opacity-70' : ''}`}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            
            <div 
              className={`
                bg-${message.role === 'user' ? 'primary' : 'secondary'} 
                px-4 py-2 rounded-lg 
                max-w-[85%] sm:max-w-[70%] 
                ${message.role === 'user' ? 'text-primary-foreground' : 'text-secondary-foreground'}
                ${!message.isFinal ? 'animate-pulse' : ''}
              `}
            >
              <p className="break-words">{message.text}</p>
              {message.timestamp && (
                <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
              )}
            </div>
            
            {message.role === 'user' && (
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {conversation.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-center text-muted-foreground">
              Aguardando início da conversa...
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 