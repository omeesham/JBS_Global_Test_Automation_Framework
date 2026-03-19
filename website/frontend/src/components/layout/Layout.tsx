import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ActivePipelineBanner from '@/components/pipeline/ActivePipelineBanner';

export default function Layout() {
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    <div className="flex min-h-screen bg-[#F5F3FF]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <ActivePipelineBanner />
        <main className={`flex-1 overflow-auto ${isChat ? '' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
