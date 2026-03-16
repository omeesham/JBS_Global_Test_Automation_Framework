import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Globe, Server, Wrench } from 'lucide-react';

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const SERVICES: ServiceOption[] = [
  {
    id: 'web',
    label: 'Web Application Testing',
    description: 'Automated testing for web applications. Full browser-based test generation and execution.',
    icon: Globe,
  },
  {
    id: 'api',
    label: 'API & Integration Testing',
    description: 'Comprehensive API validation and integration testing. REST, GraphQL, microservices coverage.',
    icon: Server,
  },
  {
    id: 'custom',
    label: 'Custom Testing Solutions',
    description: 'Tailored testing for specialized needs. ETL pipelines, data validation, SCADA, and more.',
    icon: Wrench,
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customRequirements, setCustomRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleService = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    // TODO: POST to /api/websites/:id/services with selected services
    // TODO: If 'custom' selected, POST customRequirements to /api/custom-solution-requests
    setTimeout(() => {
      navigate('/chat');
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">IQ</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1E1B4B]">Welcome to IntelliQE</h1>
        <p className="text-sm text-[#6B7280] mt-2">Select the testing capabilities for your project</p>
      </div>

      <div className="space-y-3">
        {SERVICES.map(svc => {
          const isSelected = selected.has(svc.id);
          return (
            <button
              key={svc.id}
              onClick={() => toggleService(svc.id)}
              className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-[#7C3AED] bg-[#F5F3FF]'
                  : 'border-[#DDD6FE] bg-white hover:border-[#7C3AED]/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-[#7C3AED] text-white' : 'bg-[#F5F3FF] text-[#7C3AED]'
              }`}>
                <svc.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E1B4B]">{svc.label}</p>
                <p className="text-xs text-[#6B7280] mt-1">{svc.description}</p>
              </div>
              {isSelected && <CheckCircle className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Custom requirements textarea */}
      {selected.has('custom') && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1E1B4B] mb-1">Describe your testing needs</label>
          <textarea
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            placeholder="Tell us about your specialized testing requirements..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] text-sm outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] placeholder:text-gray-400 resize-none transition-all"
          />
          <p className="text-xs text-[#6B7280] mt-1">Our team will review your request and get back to you.</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selected.size === 0 || submitting}
        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-xl text-sm font-semibold hover:from-[#6D28D9] hover:to-[#4F46E5] shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Setting up...' : 'Get Started'}
      </button>
    </div>
  );
}
