import React from 'react';
import { Bot } from 'lucide-react';
import ChatActionCard from './ChatActionCard';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseType?: 'options' | 'progress' | 'results' | 'jira_stories' | 'text';
  data?: any;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onCardAction?: (action: string, params?: any) => void;
}

function ChatMessageList({ messages, scrollRef, onCardAction }: ChatMessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-start gap-3 ${
            msg.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {msg.sender === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
          )}

          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              msg.sender === 'user'
                ? 'bg-violet-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

            {msg.sender === 'assistant' &&
              msg.responseType &&
              msg.responseType !== 'text' &&
              msg.data && (
                <div className="mt-2">
                  <ChatActionCard responseType={msg.responseType} data={msg.data} onAction={onCardAction} />
                </div>
              )}
          </div>
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );
}

export default ChatMessageList;
