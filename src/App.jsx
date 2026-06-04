import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppShell from './components/AppShell';

const LandingPage          = lazy(() => import('./pages/LandingPage'));
const AuthPage             = lazy(() => import('./pages/AuthPage'));
const LobbyPage            = lazy(() => import('./pages/LobbyPage'));
const AlertQueuePage       = lazy(() => import('./pages/AlertQueuePage'));
const InvestigationLabPage = lazy(() => import('./pages/InvestigationLabPage'));
const SummaryPage          = lazy(() => import('./pages/SummaryPage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111927]">
      <div className="text-center">
        <div className="text-[#9FEF00] text-2xl font-black tracking-tighter mb-3 neon-glow">SOC-Next</div>
        <div className="text-slate-500 text-xs font-mono uppercase tracking-widest">טוען...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<AppShell />}>
                <Route path="/lobby" element={<LobbyPage />} />
                <Route path="/alerts" element={<AlertQueuePage />} />
                <Route path="/investigate/:scenarioId" element={<InvestigationLabPage />} />
                <Route path="/summary/:scenarioId" element={<SummaryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
