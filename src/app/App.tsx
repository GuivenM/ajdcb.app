import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Actions } from './pages/Actions';
import { Guide } from './pages/Guide';
import { News } from './pages/News';
import { NewsDetail } from './pages/NewsDetail';
import { Join } from './pages/Join';
import { Contact } from './pages/Contact';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { ProtectedRoute } from './admin/ProtectedRoute';
import { Dashboard } from './admin/Dashboard';
import { AdminAdhesions } from './admin/pages/AdminAdhesions';
import { AdminMessages } from './admin/pages/AdminMessages';
import { AdminMembres } from './admin/pages/AdminMembres';
import { AdminCotisations } from './admin/pages/AdminCotisations';
import { AdminEvenements } from './admin/pages/AdminEvenements';
import { AdminActualites } from './admin/pages/AdminActualites';
import { AdminGuide } from './admin/pages/AdminGuide';
import { AdminPartenaires } from './admin/pages/AdminPartenaires';
import { AdminActions } from './admin/pages/AdminActions';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="actions" element={<Actions />} />
            <Route path="guide" element={<Guide />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="join" element={<Join />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="adhesions" element={<AdminAdhesions />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="membres" element={<AdminMembres />} />
              <Route path="cotisations" element={<AdminCotisations />} />
              <Route path="evenements" element={<AdminEvenements />} />
              <Route path="actualites" element={<AdminActualites />} />
              <Route path="guide" element={<AdminGuide />} />
              <Route path="partenaires" element={<AdminPartenaires />} />
              <Route path="actions" element={<AdminActions />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
