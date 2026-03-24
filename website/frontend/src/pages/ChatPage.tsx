import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import { chatAsk, createChatConversation, saveTestCases, exportTestCases, trackWebsiteRun, startWorker, getWorkerControlStatus, startPipelineFromChat } from '@/services/api';
import { createPipelineRun, approvePipelineRun } from '@/services/encoreApi';
import WorkerIndicator from '@/components/common/WorkerIndicator';
import { usePipelineSSE } from '@/hooks/usePipelineSSE';
import { useActivePipeline } from '@/contexts/ActivePipelineContext';
import { buildInitialStages } from '@/utils/pipeline-stages';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import ChatWelcome from '@/components/chat/ChatWelcome';
import AgentSelector from '@/components/chat/AgentSelector';
import CollapsedArtifactCard from '@/components/chat/CollapsedArtifactCard';
import JiraImportFlow from '@/components/chat/JiraImportFlow';
import ChatTriageCard from '@/components/chat/ChatTriageCard';
import ArtifactPreviewCard from '@/components/chat/ArtifactPreviewCard';
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
  responseType?: 'options' | 'progress' | 'results' | 'jira_stories' | 'text' | 'collapsed_artifact';
  data?: any;
}

type ChatModel = 'haiku' | 'sonnet' | 'opus';

type ActiveModal = 'jira' | 'column-select' | null;

const AGENT_DISPLAY_NAMES: Record<string, string> = {
  auto: 'Auto-detect',
  requirements: 'Requirements',
  planning: 'Planner',
  generation: 'Generator',
  audit: 'Audit',
  healing: 'Healer',
};

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
  const { pendingAction, pipelineMode, isActive: pipelineIsActive, stages: pipelineStages, activityMessages, runId: activeRunId, pipelineStatus, pipelineDefinition, pendingCount, activeRuns, focusRun } = activePipeline;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const model: ChatModel = 'sonnet';
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentModel, setAgentModel] = useState<ChatModel | null>(null);
  const [executionMode, setExecutionMode] = useState<'auto' | 'manual'>(
    () => (localStorage.getItem('encore_execution_mode') as 'auto' | 'manual') || 'auto'
  );
  const [pipelineModule, setPipelineModule] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [minimizedCards, setMinimizedCards] = useState<Set<string>>(new Set());

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

  const showPipelineHero = pipelineIsActive || pipelineStatus === 'completed' || pipelineStatus === 'failed' || pipelineStatus === 'awaiting_triage' || pipelineStatus === 'awaiting_approval';

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Persist execution mode
  const handleModeChange = useCallback((mode: 'auto' | 'manual') => {
    setExecutionMode(mode);
    localStorage.setItem('encore_execution_mode', mode);
  }, []);

  // Global Escape key handler for modals
  const activeModalRef = useRef(activeModal);
  activeModalRef.current = activeModal;
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalRef.current) setActiveModal(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleMinimize = useCallback((cardKey: string) => {
    setMinimizedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardKey)) next.delete(cardKey);
      else next.add(cardKey);
      return next;
    });
  }, []);

  const push = useCallback((sender: 'user' | 'assistant', text: string, extra?: Partial<ChatMessage>) => {
    setMessages(prev => [...prev, { id: uid(), sender, text, ...extra }]);
  }, []);

  // Pipeline SSE hook
  const pipeline = usePipelineSSE({
    onComplete: (event) => {
      push('assistant', 'Testing complete!', { responseType: 'results', data: { count: event.totalTests || 0, runId: event.runId } });
    },
    onError: (message) => {
      push('assistant', `Error: ${message}`);
    },
    initialStages: pipelineDefinition ? buildInitialStages(pipelineDefinition) : undefined,
  });

  // Auto-approve in auto mode — instant, no countdown
  const lastAutoApproveRef = useRef<string | null>(null);
  const pipelineStagesRef = useRef(pipelineStages);
  pipelineStagesRef.current = pipelineStages;

  useEffect(() => {
    if (pendingAction === 'approval_required' && executionMode === 'auto' && activeRunId) {
      if (lastAutoApproveRef.current === activeRunId) return;
      lastAutoApproveRef.current = activeRunId;

      const completedStage = pipelineStagesRef.current.filter(s => s.status === 'completed').pop();
      const stageName = completedStage?.key || completedStage?.name || 'Stage';

      setMessages(prev => [...prev, {
        id: uid(),
        sender: 'assistant',
        text: `${stageName} complete — auto-approved`,
        responseType: 'collapsed_artifact',
        data: { runId: activeRunId, stageName },
      }]);

      approvePipelineRun(activeRunId)
        .then(() => activePipeline.clearPendingAction())
        .catch(() => {
          setMessages(prev => [...prev, {
            id: uid(),
            sender: 'assistant',
            text: 'Auto-approve failed. Review manually.',
          }]);
        });
    }
    if (pendingAction !== 'approval_required') {
      lastAutoApproveRef.current = null;
    }
  }, [pendingAction, executionMode, activeRunId, activePipeline]);

  // Check worker status — auto-start if offline
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
        } catch (err) {
          console.warn('[ChatPage] Worker status check failed:', (err as Error).message);
        }
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

  /* ── Send message — two paths ── */
  const handleSend = async (text: string) => {
    push('user', text);
    setSending(true);

    try {
      if (selectedAgent) {
        // PATH A: Agent selected → direct pipeline start (bypass chatbot AI)
        const agentName = AGENT_DISPLAY_NAMES[selectedAgent] || selectedAgent;
        push('assistant', `Starting ${agentName}...`);

        const result = await startPipelineFromChat({
          agent: selectedAgent,
          executionMode,
          intent: text,
          clientId: client?.id,
          model: agentModel || undefined,
          targetUrl: website?.url || undefined,
          module: pipelineModule || undefined,
          feature: text.trim().slice(0, 80) || undefined,
        });

        if (result.prerequisiteMissing) {
          // Manual mode — prereqs not met
          push('assistant', `${result.error || 'Prerequisites missing.'} ${result.suggestion || ''}`);
        } else if (result.success && result.runId) {
          activePipeline.startPipeline(result.runId, executionMode);
          if (result.autoChained) {
            const fromName = AGENT_DISPLAY_NAMES[result.startedFrom || ''] || result.startedFrom;
            push('assistant', `Starting from ${fromName} (prerequisite). Running in ${executionMode} mode.`);
          } else {
            push('assistant', `Pipeline started in ${executionMode} mode.`);
          }
        } else {
          push('assistant', result.error || 'Failed to start pipeline. Is the worker running?');
        }
      } else {
        // PATH B: No agent selected → conversational AI (chatAsk)
        const response = await chatAsk({
          message: text,
          conversationId: conversationId || undefined,
          model,
        });
        push('assistant', response.text, {
          responseType: response.responseType,
          data: response.data || response.params,
        });

        // Handle chatbot actions
        if (response.action === 'connect_jira') setActiveModal('jira');
        if (response.action === 'trigger_run' && response.runId) {
          if (!client?.id) {
            push('assistant', 'Please select a client first before running the pipeline.');
          } else {
            const mode = text.match(/manual|step.by.step|review.each/i) ? 'manual' : executionMode;
            activePipeline.startPipeline(response.runId, mode);
            push('assistant', `Pipeline started in ${mode} mode.`);
          }
        }
        if (response.action === 'show_dashboard') window.location.href = '/dashboard';
        if (response.action === 'run_stage_for_page' && response.params) {
          const { pageName, stageId, mode: runMode } = response.params as { pageName?: string; stageId?: string; mode?: string };
          push('assistant', `Starting ${stageId || 'pipeline'} for "${pageName || 'page'}"...`);
          try {
            const { runId } = await createPipelineRun({
              feature: pageName || 'chat',
              module: 'chat',
              intent: text,
              clientId: client?.id,
              startStage: stageId,
            });
            activePipeline.startPipeline(runId, (runMode as 'auto' | 'manual') || executionMode);
          } catch (err) {
            push('assistant', `Failed to start: ${(err as Error).message}`);
          }
        }
        if (response.action === 'check_page_status' && response.params) {
          push('assistant', response.text || 'Checking page status...');
        }
        if (response.action === 'approve_stage') {
          if (activePipeline.runId) {
            await approvePipelineRun(activePipeline.runId);
            push('assistant', 'Approved! Pipeline continuing to next stage.');
          }
        }
        if (response.action === 'automate_jira_ticket' && response.data?.runId) {
          activePipeline.startPipeline(response.data.runId, executionMode);
        }
      }
    } catch {
      push('assistant', 'Failed to reach the backend. Check if the server is running.');
    }
    setSending(false);
  };

  /* ── Quick actions (minimal — chat is conversational) ── */
  const handleQuickAction = (action: string) => {
    if (action === 'jira' || action === 'Import from JIRA') setActiveModal('jira');
    else handleSend(action);
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
    setActiveModal(null);
  };

  const handleStorySelected = (storyKey: string, requirements: string) => {
    setPendingRequirements(requirements);
    push('user', `Selected: ${storyKey}`);
    push('assistant', 'Choose which columns you want in your test cases, then click Generate.');
    setActiveModal('column-select');
  };

  /* ── Column select → generate ── */
  const handleColumnConfirm = async () => {
    setActiveModal(null);
    push('assistant', 'Starting test generation...');
    setSending(true);
    try {
      const { runId } = await createPipelineRun({
        feature: 'manual',
        module: 'application',
        intent: pendingRequirements || 'Generate test cases',
        clientId: client?.id,
      });
      if (website?.id) {
        trackWebsiteRun(website.id, runId).catch(() => {});
      }
      activePipeline.startPipeline(runId, 'auto');
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

  // Build placeholder text
  const getPlaceholder = () => {
    if (sending) return 'Thinking...';
    if (selectedAgent) {
      const name = AGENT_DISPLAY_NAMES[selectedAgent] || selectedAgent;
      return `Tell ${name} what to test...`;
    }
    return 'Ask me anything about testing...';
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col h-full">
      {/* Worker status bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-[#EDE9FE] flex items-center justify-between flex-wrap gap-2">
        {workerOnline !== null && (
          <WorkerIndicator
            connected={workerOnline}
            onStart={handleStartWorker}
            actionLoading={workerActionLoading}
          />
        )}
      </div>

      {/* Pipeline Hero Section */}
      {showPipelineHero && (
        <div className="flex-shrink-0 border-b border-[#EDE9FE] bg-[#FAFAFE] pipeline-card-enter">
          <PipelineGraph
            liveStages={pipelineStages}
            pipelineStatus={pipelineStatus || undefined}
            heroMode
            showCost={false}
            onNodeClick={setSelectedStageId}
            pipelineDefinition={pipelineDefinition || undefined}
          />
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

      {/* Multi-page context bar */}
      {(() => {
        const pageRuns = Array.from(activeRuns.values()).filter(r => r.pageId);
        if (pageRuns.length === 0) return null;
        const focused = pageRuns.find(r => r.runId === activePipeline.runId);
        return (
          <div className="flex-shrink-0 px-4 py-1.5 border-b border-violet-100 flex items-center gap-2 text-xs">
            <span className="text-gray-500">Current:</span>
            <span className="font-medium text-gray-800">{focused?.pageName || 'Pipeline'}</span>
            {pageRuns.length > 1 && (
              <select onChange={e => focusRun(e.target.value)} value={activePipeline.runId || ''} className="ml-2 text-xs border border-gray-200 rounded px-1 py-0.5 bg-white">
                {pageRuns.map(r => (
                  <option key={r.runId} value={r.runId}>{r.pageName || r.runId.slice(0, 8)}</option>
                ))}
              </select>
            )}
          </div>
        );
      })()}

      {/* Multi-run pending badge */}
      {pendingCount > 1 && (
        <div className="flex-shrink-0 px-4 py-1.5 border-b border-amber-200 bg-amber-50 flex items-center gap-2 text-xs">
          <span className="font-medium text-amber-700">{pendingCount} stages awaiting action</span>
          <div className="flex gap-1 ml-2">
            {Array.from(activeRuns.values()).filter(r => r.pendingAction).map(r => (
              <button key={r.runId} onClick={() => focusRun(r.runId)} className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors">
                {r.pageName || r.runId.slice(0, 8)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !activeModal && !showPipelineHero && (
            <ChatWelcome username={user?.username || 'there'} />
          )}

          <ChatMessageList messages={messages.filter(m => m.responseType !== 'collapsed_artifact')} scrollRef={scrollRef} onCardAction={handleCardAction} />

          {/* Inline collapsed artifact cards for auto-approved stages */}
          {messages.filter(m => m.responseType === 'collapsed_artifact').map(m => (
            <div key={m.id} className="flex justify-center">
              <CollapsedArtifactCard
                runId={m.data?.runId}
                stageName={m.data?.stageName || 'Stage'}
              />
            </div>
          ))}

          {/* Auto-pilot status line */}
          {executionMode === 'auto' && pipelineIsActive && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-50 border border-violet-200 max-w-md mx-auto">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
              <span className="text-sm text-violet-700">Pipeline running automatically...</span>
            </div>
          )}
          {pipelineStatus === 'completed' && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 max-w-md mx-auto">
              <span className="text-sm text-emerald-700">Pipeline complete!</span>
              <a href="/dashboard" className="text-xs text-emerald-500 hover:text-emerald-700 underline ml-auto">View Results</a>
            </div>
          )}
          {pipelineStatus === 'failed' && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-50 border border-red-200 max-w-md mx-auto">
              <span className="text-sm text-red-700">Pipeline failed.</span>
              <a href="/dashboard" className="text-xs text-red-500 hover:text-red-700 underline ml-auto">View Details</a>
            </div>
          )}

          {/* Manual mode: full artifact review card */}
          {pendingAction === 'approval_required' && executionMode === 'manual' && (
            minimizedCards.has('approval') ? (
              <div className="flex justify-center">
                <button onClick={() => toggleMinimize('approval')} className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-all">
                  Stage awaiting approval — Review
                </button>
              </div>
            ) : (
              <div className="flex justify-center pipeline-card-enter">
                <ArtifactPreviewCard runId={activeRunId} />
              </div>
            )
          )}

          {/* Triage decision card */}
          {pendingAction === 'triage_required' && (
            minimizedCards.has('triage') ? (
              <div className="flex justify-center">
                <button onClick={() => toggleMinimize('triage')} className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition-all">
                  Triage pending — Review
                </button>
              </div>
            ) : (
              <div className="flex justify-center pipeline-card-enter">
                <ChatTriageCard onDecideLater={() => toggleMinimize('triage')} />
              </div>
            )
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

        {/* Agent Thinking Panel — right sidebar */}
        {selectedStageId && showPipelineHero && (
          <AgentThinkingPanel
            stageId={selectedStageId}
            stages={pipelineStages}
            activityMessages={activityMessages}
            onClose={() => setSelectedStageId(null)}
            runId={activeRunId || undefined}
          />
        )}
      </div>

      {/* Modal overlays (JIRA, column select — no pipeline launch modal) */}
      {activeModal === 'jira' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
             onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            <JiraImportFlow username={user?.username || 'admin'} onStoriesLoaded={handleStoriesLoaded} onStorySelected={handleStorySelected} />
          </div>
        </div>
      )}
      {activeModal === 'column-select' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
             onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            <ColumnSelector columns={ALL_COLUMNS} selected={selectedColumns} onChange={setSelectedColumns} onConfirm={handleColumnConfirm} />
          </div>
        </div>
      )}

      {/* Agent selector + Chat input */}
      <div className="flex-shrink-0 border-t border-[#EDE9FE] bg-white/50 backdrop-blur-sm">
        <AgentSelector
          selectedAgent={selectedAgent}
          selectedModel={agentModel}
          executionMode={executionMode}
          onSelect={(agentId, agentMdl) => { setSelectedAgent(agentId); setAgentModel(agentMdl); }}
          onModeChange={handleModeChange}
        />
        {selectedAgent && (
          <div className="px-4 pt-2 flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Module:</label>
            <input
              type="text"
              value={pipelineModule}
              onChange={e => setPipelineModule(e.target.value)}
              placeholder="e.g. locations"
              className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
            {website?.url && (
              <span className="text-xs text-gray-400 truncate max-w-[200px]" title={website.url}>{website.url}</span>
            )}
          </div>
        )}
        <div className="px-4 py-3">
          <ChatInput onSend={handleSend} disabled={sending} placeholder={getPlaceholder()} />
        </div>
      </div>
    </div>
  );
}
