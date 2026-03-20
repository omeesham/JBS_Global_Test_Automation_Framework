import { useState, useRef, useEffect } from 'react';
import { Globe, Lock, Settings, Search, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface ClientSetupWizardProps {
  clientId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

type WizardStep = 'welcome' | 'url' | 'auth' | 'config' | 'discovering' | 'complete';

export default function ClientSetupWizard({ clientId, onComplete, onClose }: ClientSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [homeUrl, setHomeUrl] = useState('');
  const [authType, setAuthType] = useState<'sso' | 'basic' | 'none'>('none');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [maxPages, setMaxPages] = useState(100);
  const [maxDepth, setMaxDepth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup poll interval on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);
  const [discoveryStatus, setDiscoveryStatus] = useState<string>('Starting discovery...');

  const handleStartDiscovery = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        clientId,
        homeUrl,
        maxPages,
        maxDepth,
        initiatedBy: 'setup-wizard',
      };
      if (authType !== 'none') {
        body.authType = authType;
        body.credentials = authType === 'basic' ? { username, password } : { provider: 'sso' };
      }

      const res = await fetch('/api/setup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Setup failed');
      }
      setStep('discovering');
      setDiscoveryStatus('Discovery agent is exploring your application...');

      // Poll for completion (ref-based so unmount cleanup works)
      if (pollRef.current) clearInterval(pollRef.current);
      let pollErrors = 0;
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/setup/status?clientId=${encodeURIComponent(clientId)}`);
          const status = await statusRes.json();
          pollErrors = 0;
          if (status.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setStep('complete');
          } else if (status.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setError('Discovery failed. Check the dashboard for details.');
            setStep('config');
          } else {
            setDiscoveryStatus(`Discovery in progress... (${status.status})`);
          }
        } catch {
          pollErrors++;
          if (pollErrors >= 5) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setError('Lost connection. Check if the backend is running.');
            setStep('config');
          }
        }
      }, 5000);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  const stepConfig: Record<WizardStep, { icon: React.ElementType; title: string; subtitle: string }> = {
    welcome: { icon: Settings, title: 'Set Up Your Project', subtitle: 'We\'ll help you configure your testing environment' },
    url: { icon: Globe, title: 'Application URL', subtitle: 'Where should the AI agent start exploring?' },
    auth: { icon: Lock, title: 'Authentication', subtitle: 'How does your team access the application?' },
    config: { icon: Settings, title: 'Discovery Settings', subtitle: 'Configure how the agent explores your app' },
    discovering: { icon: Search, title: 'Discovering Pages', subtitle: 'The AI agent is exploring your application' },
    complete: { icon: CheckCircle2, title: 'Setup Complete!', subtitle: 'Your pages have been discovered' },
  };

  const current = stepConfig[step];
  const Icon = current.icon;

  return (
    <div className="bg-white rounded-2xl border border-violet-200 shadow-sm max-w-lg w-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{current.title}</h3>
            <p className="text-sm text-gray-500">{current.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {step === 'welcome' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">This wizard will guide you through:</p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Setting your application URL</li>
              <li>Configuring authentication</li>
              <li>Running AI-powered page discovery</li>
            </ol>
            <button onClick={() => setStep('url')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Application URL</label>
              <input type="url" value={homeUrl} onChange={e => setHomeUrl(e.target.value)} placeholder="https://your-app.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('welcome')} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => homeUrl && setStep('auth')} disabled={!homeUrl} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all disabled:opacity-50">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'auth' && (
          <div className="space-y-4">
            <div className="space-y-2">
              {(['none', 'sso', 'basic'] as const).map(type => (
                <button key={type} onClick={() => setAuthType(type)} className={`w-full px-4 py-3 rounded-xl border text-left text-sm transition-all ${authType === type ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-violet-300'}`}>
                  {type === 'none' ? 'No Authentication Required' : type === 'sso' ? 'SSO / Microsoft Login' : 'Username & Password'}
                </button>
              ))}
            </div>
            {authType === 'basic' && (
              <div className="space-y-2">
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setStep('url')} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep('config')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'config' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Max Pages to Discover</label>
              <input type="number" value={maxPages} onChange={e => setMaxPages(Number(e.target.value))} min={1} max={500} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Max Depth</label>
              <input type="number" value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))} min={1} max={10} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => setStep('auth')} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={handleStartDiscovery} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all disabled:opacity-50">
                {loading ? 'Starting...' : 'Start Discovery'} <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'discovering' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-600">{discoveryStatus}</p>
            <p className="text-xs text-gray-400">This may take a few minutes</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm text-gray-600">Pages have been discovered and are ready for testing.</p>
            <button onClick={() => { onComplete?.(); onClose?.(); }} className="w-full px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
