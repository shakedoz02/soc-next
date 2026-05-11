import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import AlertQueuePage from './pages/AlertQueuePage';
import InvestigationLabPage from './pages/InvestigationLabPage';
import SummaryPage from './pages/SummaryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}
