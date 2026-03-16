import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/chat' : '/login');
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4C1D95]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-[#0B0F1A]/60" />

      {/* Logo */}
      <div className="relative z-10 px-8 pt-8">
        <div className="flex items-center gap-3">
          <img src="/jbs-logo.svg" alt="JBS IntelliQE" className="h-36" />
        </div>
      </div>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-10">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              IntelliQE
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 mt-5 font-medium leading-relaxed">
            Intelligent Quality Engineering powered by AI
          </p>

          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            Just describe what to test. Our testing engine generates, executes, and
            self-heals your entire test suite. No setup or coding required.
          </p>

          <button
            onClick={handleGetStarted}
            className="group mt-10 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base rounded-2xl transition-all shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            Start Testing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10 py-4 px-6 text-center">
        <span className="text-xs text-gray-600">&copy; IntelliQE</span>
      </div>
    </div>
  );
}
