import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PreferencesTab from '@/components/settings/PreferencesTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import TestingConfigTab from '@/components/settings/TestingConfigTab';
import TeamMembersTab from '@/components/settings/TeamMembersTab';
import PlatformConfigTab from '@/components/settings/PlatformConfigTab';
import PipelineBuilderTab from '@/components/settings/PipelineBuilderTab';
import AiProviderTab from '@/components/settings/AiProviderTab';

export default function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role || 'qa_engineer';
  const [activeTab, setActiveTab] = useState('preferences');

  const tabs = [
    { id: 'preferences', label: 'My Preferences', roles: ['super_admin', 'client_admin', 'qa_engineer', 'data_engineer'] },
    { id: 'integrations', label: 'Integrations', roles: ['super_admin', 'client_admin', 'qa_engineer', 'data_engineer'] },
    { id: 'testing', label: 'Testing Config', roles: ['super_admin', 'client_admin'] },
    { id: 'team', label: 'Team Members', roles: ['super_admin', 'client_admin'] },
    { id: 'platform', label: 'Platform Config', roles: ['super_admin'] },
    { id: 'pipeline', label: 'Pipeline Builder', roles: ['super_admin'] },
    { id: 'ai-provider', label: 'AI Provider', roles: ['super_admin'] },
  ].filter(t => t.roles.includes(role));

  return (
    <div className={`space-y-6 ${activeTab === 'pipeline' ? '' : 'max-w-4xl'}`}>
      <div>
        <h2 className="text-2xl font-bold text-[#1E1B4B]">Settings</h2>
        <p className="text-sm text-[#6B7280]">Configuration and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-[#F5F3FF] p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#7C3AED] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1E1B4B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pipeline' ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 overflow-hidden">
          <PipelineBuilderTab />
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#DDD6FE]/60 p-6">
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'integrations' && <IntegrationsTab username={user?.username || ''} />}
          {activeTab === 'testing' && <TestingConfigTab />}
          {activeTab === 'team' && <TeamMembersTab />}
          {activeTab === 'platform' && <PlatformConfigTab />}
          {activeTab === 'ai-provider' && <AiProviderTab />}
        </div>
      )}
    </div>
  );
}
