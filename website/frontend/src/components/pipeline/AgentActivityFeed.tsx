import { Bot, ArrowDown } from 'lucide-react';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { ActivityMessage } from '@/hooks/usePipelineSSE';

interface Props {
  messages: ActivityMessage[];
  maxMessages?: number;
}

/** Stage labels for display */
const STAGE_LABELS: Record<string, string> = {
  requirements: 'Requirements',
  planning: 'Planner',
  generation: 'Generator',
  healing: 'Healer',
  audit: 'Audit',
};

export default function AgentActivityFeed({ messages, maxMessages = 50 }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showTyping, setShowTyping] = useState(false);

  // Track if user has scrolled away from bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    setIsAtBottom(atBottom);
  }, []);

  // Auto-scroll when new messages arrive (only if already at bottom)
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isAtBottom]);

  // Typing indicator — show when no new message for 3s
  useEffect(() => {
    if (messages.length === 0) return;
    setShowTyping(false);
    const timer = setTimeout(() => setShowTyping(true), 3000);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const jumpToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  const visible = messages.slice(-maxMessages);

  // Group consecutive messages from the same stage
  const groups: { stage: string; messages: { message: string; timestamp: string }[] }[] = [];
  for (const msg of visible) {
    const last = groups[groups.length - 1];
    if (last && last.stage === msg.stage) {
      last.messages.push({ message: msg.message, timestamp: msg.timestamp });
    } else {
      groups.push({ stage: msg.stage, messages: [{ message: msg.message, timestamp: msg.timestamp }] });
    }
  }

  return (
    <div className="rounded-xl border border-[#DDD6FE] bg-white shadow-sm relative">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EDE9FE]">
        <Bot className="w-4 h-4 text-[#7C3AED]" />
        <h4 className="text-xs font-semibold text-[#1E1B4B]">Agent Activity</h4>
        <span className="ml-auto text-[10px] text-[#6B7280]">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-64 overflow-y-auto px-4 py-3 space-y-3"
      >
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-1.5">
            {/* Stage header (shown when stage changes) */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-[#7C3AED] uppercase tracking-wide">
                {STAGE_LABELS[group.stage] || group.stage}
              </span>
            </div>

            {/* Chat bubbles */}
            {group.messages.map((msg, mi) => {
              const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              });
              return (
                <div key={mi} className="ml-8 flex items-end gap-2">
                  <div className="bg-[#F5F3FF] rounded-xl rounded-tl-sm px-3 py-1.5 max-w-[85%]">
                    <p className="text-xs text-[#374151] leading-relaxed">{msg.message}</p>
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] font-mono whitespace-nowrap flex-shrink-0">{time}</span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {showTyping && visible.length > 0 && (
          <div className="ml-8 flex items-center gap-2">
            <div className="bg-[#F5F3FF] rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {visible.length === 0 && (
          <div className="flex items-center gap-2 justify-center py-4">
            <Bot className="w-4 h-4 text-[#9CA3AF]" />
            <p className="text-xs text-[#9CA3AF]">Waiting for agent activity...</p>
          </div>
        )}
      </div>

      {/* Jump to bottom */}
      {!isAtBottom && visible.length > 5 && (
        <button
          onClick={jumpToBottom}
          className="absolute bottom-14 right-4 w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-lg hover:bg-[#6D28D9] transition-colors"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
