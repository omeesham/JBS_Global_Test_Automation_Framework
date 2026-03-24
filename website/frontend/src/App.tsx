import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ClientProvider } from '@/contexts/ClientContext';
import { WebsiteProvider } from '@/contexts/WebsiteContext';
import { ActivePipelineProvider } from '@/contexts/ActivePipelineContext';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import ChatPage from '@/pages/ChatPage';
import DashboardPage from '@/pages/DashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import OnboardingPage from '@/pages/OnboardingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginPage />}
      />

      {/* Protected routes with sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClientProvider>
          <WebsiteProvider>
            <ActivePipelineProvider>
              <AppRoutes />
            </ActivePipelineProvider>
          </WebsiteProvider>
        </ClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
