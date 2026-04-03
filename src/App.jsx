import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import ProfileSelect from './pages/ProfileSelect';
import SeriesDetail from './pages/SeriesDetail';
import Player from './pages/Player';
import Search from './pages/Search';
import MyListPage from './pages/MyListPage';
import Browse from './pages/Browse';
import ActivateCode from './pages/ActivateCode';
import Propose from './pages/Propose';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSeries from './pages/admin/AdminSeries';
import AdminEpisodes from './pages/admin/AdminEpisodes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCodes from './pages/admin/AdminCodes';
import AdminProposals from './pages/admin/AdminProposals';
import AdminAvatars from './pages/admin/AdminAvatars';
import AdminEpisodeCreator from './pages/admin/AdminEpisodeCreator';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminMetrics from './pages/admin/AdminMetrics';
import AdminBanner from './pages/admin/AdminBanner';
import AdminPersistence from './pages/admin/AdminPersistence';
import Subscription from './pages/Subscription';
import AppLayout from './components/layout/AppLayout';

/** Protege rotas que exigem login; redireciona para /Login se não autenticado. */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/Login" replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/Login" replace />;
  if (!isAdmin) return <Navigate to="/Home" replace />;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">
            <span className="text-[#E50914]">KIDS</span>
            <span className="text-[#FFC107]">Play</span>
          </h1>
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Rota raiz → login se não autenticado, senão seleção de perfil */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/ProfileSelect' : '/Login'} replace />} />

      {/* Página de login — pública */}
      <Route path="/Login" element={<LoginPage />} />

      {/* Rotas protegidas: exigem login */}
      <Route path="/ProfileSelect" element={<RequireAuth><ProfileSelect /></RequireAuth>} />
      <Route path="/ActivateCode" element={<RequireAuth><ActivateCode /></RequireAuth>} />
      <Route path="/Player" element={<RequireAuth><Player /></RequireAuth>} />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/Home" element={<Home />} />
        <Route path="/SeriesDetail" element={<SeriesDetail />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/MyList" element={<MyListPage />} />
        <Route path="/Browse" element={<Browse />} />
        <Route path="/Propose" element={<Propose />} />
        <Route path="/Subscription" element={<Subscription />} />
        <Route path="/Admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/AdminSeries" element={<RequireAdmin><AdminSeries /></RequireAdmin>} />
        <Route path="/AdminEpisodes" element={<RequireAdmin><AdminEpisodes /></RequireAdmin>} />
        <Route path="/AdminUsers" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="/AdminCodes" element={<RequireAdmin><AdminCodes /></RequireAdmin>} />
        <Route path="/AdminProposals" element={<RequireAdmin><AdminProposals /></RequireAdmin>} />
        <Route path="/AdminAvatars" element={<RequireAdmin><AdminAvatars /></RequireAdmin>} />
        <Route path="/AdminEpisodeCreator" element={<RequireAdmin><AdminEpisodeCreator /></RequireAdmin>} />
        <Route path="/AdminSubscriptions" element={<RequireAdmin><AdminSubscriptions /></RequireAdmin>} />
        <Route path="/AdminMetrics" element={<RequireAdmin><AdminMetrics /></RequireAdmin>} />
        <Route path="/AdminBanner" element={<RequireAdmin><AdminBanner /></RequireAdmin>} />
        <Route path="/AdminPersistence" element={<RequireAdmin><AdminPersistence /></RequireAdmin>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App