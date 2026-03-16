import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import {
  LayoutDashboard, MessageSquare, Settings,
  LogOut, Shield, User,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Chat',      path: '/chat',      icon: MessageSquare },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Settings',  path: '/settings',  icon: Settings },
];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  client_admin: 'Client Admin',
  qa_engineer: 'QA Engineer',
  data_engineer: 'Data Engineer',
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-amber-400/20 text-amber-300',
  client_admin: 'bg-orange-400/20 text-orange-300',
  qa_engineer: 'bg-violet-400/20 text-violet-300',
  data_engineer: 'bg-cyan-400/20 text-cyan-300',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role: UserRole = (user?.role as UserRole) || 'qa_engineer';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-[#1E1B4B] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/jbs-logo.svg" alt="JBS IntelliQE" className="h-16" />
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            {role === 'super_admin' || role === 'client_admin'
              ? <Shield className="w-3.5 h-3.5 text-white" />
              : <User className="w-3.5 h-3.5 text-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.displayName || user?.username || 'User'}
            </p>
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${ROLE_COLORS[role] || ROLE_COLORS.qa_engineer}`}>
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white shadow-lg shadow-purple-900/30'
                  : 'text-[#C4B5FD] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#C4B5FD] hover:bg-white/5 hover:text-white transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <div className="flex items-center gap-2 text-xs text-[#A5B4FC] px-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>System: Online</span>
        </div>
      </div>
    </aside>
  );
}
