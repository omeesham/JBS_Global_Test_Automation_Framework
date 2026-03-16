import { Activity } from 'lucide-react';
import { useRef, useEffect } from 'react';
import type { ActivityMessage } from '@/hooks/usePipelineSSE';

interface Props {
  messages: ActivityMessage[];
  maxMessages?: number;
}

export default function AgentActivityFeed({ messages, maxMessages = 50 }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const visible = messages.slice(-maxMessages);

  return (
    <div className="rounded-xl border border-[#DDD6FE] bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EDE9FE]">
        <Activity className="w-4 h-4 text-[#7C3AED]" />
        <h4 className="text-xs font-semibold text-[#1E1B4B]">Agent Activity</h4>
        <span className="ml-auto text-[10px] text-[#6B7280]">{messages.length} events</span>
      </div>
      <div
        ref={scrollRef}
        className="max-h-48 overflow-y-auto px-4 py-2 space-y-1.5"
      >
        {visible.map((msg, i) => {
          const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          });
          return (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-[10px] text-[#9CA3AF] font-mono whitespace-nowrap mt-0.5">{time}</span>
              <span className="text-[#7C3AED] font-medium whitespace-nowrap">{msg.stage}</span>
              <span className="text-[#374151]">{msg.message}</span>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-xs text-[#9CA3AF] text-center py-3">Waiting for agent activity...</p>
        )}
      </div>
    </div>
  );
}
