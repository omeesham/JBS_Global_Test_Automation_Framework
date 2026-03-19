import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import { chatAsk, createChatConversation, saveTestCases, exportTestCases, trackWebsiteRun, startWorker, getWorkerControlStatus } from '@/services/api';
import { createPipelineRun } from '@/services/encoreApi';
import WorkerIndicator from '@/components/common/WorkerIndicator';
import { usePipelineSSE } from '@/hooks/usePipelineSSE';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { buildInitialStages } from '@/utils/pipeline-stages';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import ChatWelcome from '@/components/chat/ChatWelcome';
import ModelSelector from '@/components/chat/ModelSelector';
import JiraImportFlow from '@/components/chat/JiraImportFlow';
import PipelineProgress from '@/components/chat/PipelineProgress';
import PipelineLaunchCard from '@/components/chat/PipelineLaunchCard';
import ChatApprovalCard from '@/components/chat/ChatApprovalCard';
import ChatTriageCard from '@/components/chat/ChatTriageCard';
import TestCaseResults from '@/components/chat/TestCaseResults';
import ColumnSelector from '@/components/chat/ColumnSelector';
import PipelineGraph from '@/components/pipeline/PipelineGraph';
import AgentActivityFeed from '@/components/pipeline/AgentActivityFeed';
import AgentThinkingPanel from '@/components/pipeline/AgentThinkingPanel';
import { ChevronDown, ChevronUp, Bot } from 'lucide-react';

/* ── Types ── */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseType?: 'options' | 'progress' | 'results' | 'jira_stories' | 'text';
  data?: any;
}

type ChatModel = 'haiku' | 'sonnet' | 'opus';

type View = 'chat' | 'jira' | 'column-select' | 'results' | 'pipeline' | 'launch';

const ALL_COLUMNS = [
  { key: 'tcNumber', label: 'TC Number', default: true },
  { key: 'title', label: 'Test Case Title', default: true },
  { key: 'steps', label: 'Test Steps', default: true },
  { key: 'expected', label: 'Expected Result', default: true },
  { key: 'priority', label: 'Priority', default: true },
  { key: 'type', label: 'Type', default: true },
  { key: 'feature', label: 'Feature / Module', default: false },
  { key: 'precondition', label: 'Preconditions', default: false },
  { key: 'status', label: 'Status', default: false },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ── Main Orchestrator ── */
export default function ChatPage() {
  const { user } = useAuth();
  const { client } = useClient();
  const { website } = useWebsite();
  const activePipeline = useActivePipeline();
  const { pendingAction, pipelineMode, isActive: pipelineIsActive, stages: pipelineStages, activityMessages, runId: activeRunId, pipelineStatus, pipelineDefinition } = activePipeline;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [model, setModel] = useState<ChatModel>('sonnet');
  const [thinking, setThinking] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [view, setView] = useState<View>('chat');

  // Pipeline hero section state
  const [showActivity, setShowActivity] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Test results
  const [testCases, setTestCases] = useState<any[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(ALL_COLUMNS.filter(c => c.default).map(c => c.key));
  const [savedRunId, setSavedRunId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingRequirements, setPendingRequirements] = useState('');
  const [workerOnline, setWorkerOnline] = useState<boolean | null>(null);
  const [workerActionLoading, setWorkerActionLoading] = useState(false);
  const autoStartAttempted = useRef(false);

  // Show pipeline hero when pipeline is active or recently completed
  const showPipelineHero = pipelineIsActive || pipelineStatus === 'completed' || pipelineStatus === 'failed' || pipelineStatus === 'awaiting_triage' || pipelineStatus === 'awaiting_approval';

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const push = useCallback((sender: 'user' | 'assistant', text: string, extra?: Partial<ChatMessage>) => {
    setMessages(prev => [...prev, { id: uid(), sender, text, ...extra }]);
  }, []);

  // Pipeline SSE hook (page-specific callbacks only)
  const pipeline = usePipelineSSE({
    onComplete: (event) => {
      push('assistant', 'Testing complete!', { responseType: 'results', data: { count: event.totalTests || 0, runId: event.runId } });
      setView('chat');
    },
    onError: (message) => {
      push('assistant', `Error: ${message}`);
      setView('chat');
    },
    initialStages: pipelineDefinition ? buildInitialStages(pipelineDefinition) : undefined,
  });

  // Check worker status — auto-start if offline (one attempt per page load)
  useEffect(() => {
    getWorkerControlStatus()
      .then((s) => {
        setWorkerOnline(s.connected);
        if (!s.connected && !autoStartAttempted.current) {
          autoStartAttempted.current = true;
          startWorker()
            .then(() => {
              setTimeout(() => {
                getWorkerControlStatus()
                  .then((s2) => setWorkerOnline(s2.connected))
                  .catch(() => {});
              }, 3000);
            })
            .catch(() => {});
        }
      })
      .catch(() => setWorkerOnline(null));
  }, []);

  const handleStartWorker = useCallback(async () => {
    setWorkerActionLoading(true);
    try {
      await startWorker();
      setTimeout(async () => {
        try {
          const s = await getWorkerControlStatus();
          setWorkerOnline(s.connected);
        } catch {}
        setWorkerActionLoading(false);
      }, 3000);
    } catch {
      setWorkerActionLoading(false);
    }
  }, []);

  // Initialize conversation
  useEffect(() => {
    if (!conversationId && user?.username) {
      createChatConversation(user.username, 'Chat session')
        .then(c => setConversationId(c.id))
        .catch(() => {});
    }
  }, [user?.username, conversationId]);

  /* ── Send message to AI ── */
  const handleSend = async (text: string) => {
    push('user', text);
    setSending(true);
    try {
      const response = await chatAsk({
        message: text,
        conversationId: conversationId || undefined,
        model,
        thinkingEnabled: thinking,
      });
      push('assistant', response.text, {
        responseType: response.responseType,
        data: response.data || response.params,
      });

      // Handle actions
      if (response.action === 'connect_jira') setView('jira');
      if (response.action === 'trigger_run' && response.runId) {
        // Chat-triggered pipeline auto-start (A5)
        if (!client?.id) {
          push('assistant', 'Please select a client first before running the pipeline.');
        } else {
          const mode = text.match(/manual|step.by.step|review.each/i) ? 'manual' : 'auto';
          activePipeline.startPipeline(response.runId, mode);
          push('assistant', `Pipeline started in ${mode} mode. Watch the live progress above.`);
          setView('chat');
        }
      }
      if (response.action === 'show_dashboard') window.location.href = '/dashboard';
    } catch {
      push('assistant', 'Failed to reach the AI. Check if the backend is running.');
    }
    setSending(false);
  };

  /* ── Quick actions ── */
  const handleQuickAction = (action: string) => {
    if (action === 'run_pipeline') {
      push('assistant', 'Let\'s set up your test pipeline. Choose your options below:');
      setView('launch');
    } else if (action === 'past_runs') {
      window.location.href = '/dashboard';
    } else if (action === 'generate') handleSend('I want to generate tests');
    else if (action === 'jira' || action === 'Import from JIRA') setView('jira');
    else if (action === 'dashboard' || action === 'View Dashboard') window.location.href = '/dashboard';
    else if (action === 'status') handleSend('What is the status of my latest run?');
    else handleSend(action);
  };

  /* ── Pipeline launched from card ── */
  const handlePipelineStarted = (_runId: string) => {
    push('assistant', 'Pipeline started! Watch the live progress above.');
    setView('chat');
  };

  /* ── Action card clicks ── */
  const handleCardAction = (action: string, params?: any) => {
    if (action === 'select_option') handleSend(params);
    else if (action === 'select_story') handleSend(`Generate tests for ${params}`);
    else if (action === 'view_dashboard') window.location.href = '/dashboard';
    else if (action === 'download') handleExport('csv');
    else if (action === 'run_again') handleSend('Run the tests again');
  };

  /* ── JIRA callbacks ── */
  const handleStoriesLoaded = (stories: { key: string; summary: string }[]) => {
    push('assistant', `Found ${stories.length} stories. Select one to generate tests.`, {
      responseType: 'jira_stories',
      data: { stories },
    });
    setView('chat');
  };

  const handleStorySelected = (storyKey: string, requirements: string) => {
    setPendingRequirements(requirements);
    push('user', `Selected: ${storyKey}`);
    push('assistant', 'Choose which columns you want in your test cases, then click Generate.');
    setView('column-select');
  };

  /* ── Column select → generate ── */
  const handleColumnConfirm = async () => {
    setView('chat');
    push('assistant', 'Starting test generation...');
    setSending(true);
    try {
      const { runId } = await createPipelineRun({
        feature: 'manual',
        module: 'application',
        intent: pendingRequirements || 'Generate test cases',
        clientId: client?.id,
      });
      // Track website-run association
      if (website?.id) {
        trackWebsiteRun(website.id, runId).catch(() => {});
      }
      activePipeline.startPipeline(runId, 'auto');
      setView('chat');
    } catch {
      push('assistant', 'Could not start the testing process. Backend may be unavailable.');
    }
    setSending(false);
  };

  /* ── Save / Export ── */
  const handleSaveTestCases = async (tcs: any[]) => {
    setIsSaving(true);
    try {
      const res = await saveTestCases({
        username: user?.username || 'admin',
        columns: selectedColumns,
        testCases: tcs,
      });
      setSavedRunId(res.testRunId);
      push('assistant', `${tcs.length} test cases saved!`);
    } catch {
      push('assistant', 'Failed to save test cases.');
    }
    setIsSaving(false);
  };

  const handleExport = async (format: string) => {
    if (!savedRunId) return;
    setIsExporting(true);
    try {
      const response = await exportTestCases(savedRunId, format);
      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `testcases.${format === 'excel' ? 'csv' : 'csv'}`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      push('assistant', 'Export failed.');
    }
    setIsExporting(false);
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col h-full">
      {/* Model selector bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-[#EDE9FE] flex items-center justify-between flex-wrap gap-2">
        <ModelSelector model={model} onModelChange={setModel} thinking={thinking} onThinkingChange={setThinking} />
        {workerOnline !== null && (
          <WorkerIndicator
            connected={workerOnline}
            onStart={handleStartWorker}
            actionLoading={workerActionLoading}
          />
        )}
      </div>

      {/* Pipeline Hero Section — always visible when pipeline is active */}
      {showPipelineHero && (
        <div className="flex-shrink-0 border-b border-[#EDE9FE] bg-[#FAFAFE] pipeline-card-enter">
          {/* Pipeline Graph */}
          <PipelineGraph
            liveStages={pipelineStages}
            pipelineStatus={pipelineStatus || undefined}
            heroMode
            showCost={false}
            onNodeClick={setSelectedStageId}
            pipelineDefinition={pipelineDefinition || undefined}
          />

          {/* Agent Activity Feed — collapsible */}
          <div className="border-t border-[#EDE9FE]">
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-violet-50/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-[#1E1B4B]">Agent Activity</span>
                {activityMessages.length > 0 && (
                  <span className="text-[10px] text-gray-400">{activityMessages.length} messages</span>
                )}
              </div>
              {showActivity ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showActivity && (
              <div className="max-h-48 overflow-hidden">
                <AgentActivityFeed messages={activityMessages} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content area — flex row to accommodate thinking panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat content column */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && view === 'chat' && !showPipelineHero && (
            <ChatWelcome username={user?.username || 'there'} onQuickAction={handleQuickAction} />
          )}

          <ChatMessageList messages={messages} scrollRef={scrollRef} onCardAction={handleCardAction} />

          {view === 'jira' && (
            <JiraImportFlow username={user?.username || 'admin'} onStoriesLoaded={handleStoriesLoaded} onStorySelected={handleStorySelected} />
          )}

          {view === 'column-select' && (
            <div className="max-w-lg ml-11">
              <ColumnSelector columns={ALL_COLUMNS} selected={selectedColumns} onChange={setSelectedColumns} onConfirm={handleColumnConfirm} />
            </div>
          )}

          {view === 'launch' && (
            <div className="flex justify-center pipeline-card-enter">
              <PipelineLaunchCard onStarted={handlePipelineStarted} />
            </div>
          )}

          {view === 'pipeline' && pipeline.stages.length > 0 && (
            <div className="max-w-md ml-11">
              <PipelineProgress stages={pipeline.stages} />
            </div>
          )}

          {/* Approval gate card (manual mode) */}
          {pendingAction === 'approval_required' && pipelineMode === 'manual' && (
            <div className="flex justify-center pipeline-card-enter">
              <ChatApprovalCard />
            </div>
          )}

          {/* Triage decision card */}
          {pendingAction === 'triage_required' && (
            <div className="flex justify-center pipeline-card-enter">
              <ChatTriageCard />
            </div>
          )}

          {testCases.length > 0 && (
            <TestCaseResults
              testCases={testCases}
              columns={selectedColumns}
              onSave={handleSaveTestCases}
              onExport={handleExport}
              savedRunId={savedRunId}
              isSaving={isSaving}
              isExporting={isExporting}
            />
          )}
        </div>

        {/* Agent Thinking Panel — right sidebar when a node is clicked */}
        {selectedStageId && showPipelineHero && (
          <AgentThinkingPanel
            stageId={selectedStageId}
            stages={pipelineStages}
            activityMessages={activityMessages}
            onClose={() => setSelectedStageId(null)}
          />
        )}
      </div>

      {/* Chat input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-[#EDE9FE] bg-white/50 backdrop-blur-sm">
        <ChatInput onSend={handleSend} disabled={sending} placeholder={sending ? 'Thinking...' : 'Ask me anything about testing...'} />
      </div>
    </div>
  );
}
