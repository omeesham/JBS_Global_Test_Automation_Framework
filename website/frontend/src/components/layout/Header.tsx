import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClient } from '@/contexts/ClientContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import { useNavigate } from 'react-router-dom';

const roleBadgeColors: Record<string, string> = {
  super_admin: 'bg-[#7C3AED] text-white',
  client_admin: 'bg-[#DDD6FE] text-[#5B21B6]',
  qa_engineer: 'bg-[#EDE9FE] text-[#6D28D9]',
  data_engineer: 'bg-[#F5F3FF] text-[#7C3AED]',
};

export default function Header() {
  const { user, logout } = useAuth();
  const { client, clients, setActiveClient, loading: clientLoading } = useClient();
  const { website, websites, setActiveWebsite, loading: websiteLoading } = useWebsite();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 min-w-[60px]">
        <img src="/jbs-logo-dark.svg" alt="JBS IntelliQE" className="h-10" />
      </div>

      {/* Center: Dropdowns */}
      <div className="flex items-center gap-4">
        {/* Client dropdown */}
        {isSuperAdmin ? (
          <div className="relative">
            <select
              value={client?.id ?? ''}
              onChange={(e) => setActiveClient(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-700">
            {clientLoading ? 'Loading...' : (client?.name ?? 'No client assigned')}
          </span>
        )}

        <span className="text-gray-300">/</span>

        {/* Website dropdown */}
        <div className="relative">
          <select
            value={website?.id ?? ''}
            onChange={(e) => setActiveWebsite(e.target.value)}
            disabled={websites.length === 0}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {websites.length === 0 && <option value="">{websiteLoading ? 'Loading...' : 'No websites'}</option>}
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-3">
        <div className="text-right text-sm">
          <p className="font-medium text-gray-800 capitalize">{user?.username ?? 'User'}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleBadgeColors[user?.role ?? ''] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {user?.role?.replace('_', ' ') ?? 'guest'}
        </span>
        <button
          onClick={handleLogout}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
