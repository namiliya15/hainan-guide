import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useSession } from './hooks/useSession';
import { useIsAdmin } from './hooks/useIsAdmin';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/Navbar';
import { AuthModal } from './features/auth/AuthModal';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticlePage } from './pages/ArticlePage';
import { ArticleEditorPage } from './pages/ArticleEditorPage';
import { AdminInboxPage } from './pages/AdminInboxPage';
import { MySubmissionsPage } from './pages/MySubmissionsPage';

export default function App() {
  const { session, setSession, loading, signOut } = useSession();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = useIsAdmin(session);
  const location = useLocation();

  const [authOpen, setAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState('');
  const [addPlaceSignal, setAddPlaceSignal] = useState(0);

  function openAuth(reasonText) {
    setAuthReason(
      reasonText === 'signIn' || reasonText === 'signUp' || !reasonText
        ? ''
        : reasonText
    );
    setAuthOpen(true);
  }

  // Вызывается из карточки места, когда неавторизованный пользователь
  // пытается добавить место в избранное — вкладка "Избранное" видна всем,
  // но действие требует входа.
  function requireAuthForFavorite() {
    setAuthReason('Чтобы добавить в избранное, необходимо авторизоваться');
    setAuthOpen(true);
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-sand text-lagoon dark:bg-night dark:text-aqua">
        <RefreshCw className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand text-ink dark:bg-night dark:text-white">
      <Navbar
        session={session}
        isAdmin={isAdmin && location.pathname === '/'}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={signOut}
        onOpenAuth={openAuth}
        onAddPlace={() => setAddPlaceSignal((s) => s + 1)}
      />

      <Routes>
        <Route path="/" element={<HomePage session={session} onRequireAuth={requireAuthForFavorite} addPlaceSignal={addPlaceSignal} />} />
        <Route path="/articles" element={<ArticlesPage session={session} />} />
        <Route path="/articles/new" element={<ArticleEditorPage session={session} />} />
        <Route path="/articles/:slug/edit" element={<ArticleEditorPage session={session} />} />
        <Route path="/articles/:slug" element={<ArticlePage session={session} />} />
        <Route path="/admin/inbox" element={<AdminInboxPage session={session} />} />
        <Route path="/my-submissions" element={<MySubmissionsPage session={session} />} />
      </Routes>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSession={setSession}
        reason={authReason}
      />
    </div>
  );
}
