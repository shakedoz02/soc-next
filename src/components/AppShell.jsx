import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111927]">
        <div className="text-center">
          <div className="text-[#9FEF00] text-2xl font-black tracking-tighter mb-3 neon-glow">SOC-Next</div>
          <div className="text-slate-500 text-xs font-mono uppercase tracking-widest">טוען מערכת...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-[#111927]">
      <TopBar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 mr-60 min-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
