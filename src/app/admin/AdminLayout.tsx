import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Mail,
  Newspaper,
  Activity,
  Users,
  Wallet,
  CalendarDays,
  BookOpen,
  Handshake,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Navbar';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
  { label: 'Adhésions', path: '/admin/adhesions', icon: UserPlus },
  { label: 'Messages', path: '/admin/messages', icon: Mail },
  { label: 'Actualités', path: '/admin/actualites', icon: Newspaper },
  { label: 'Actions', path: '/admin/actions', icon: Activity },
  { label: 'Membres', path: '/admin/membres', icon: Users },
  { label: 'Cotisations', path: '/admin/cotisations', icon: Wallet },
  { label: 'Événements', path: '/admin/evenements', icon: CalendarDays },
  { label: 'Guide', path: '/admin/guide', icon: BookOpen },
  { label: 'Partenaires', path: '/admin/partenaires', icon: Handshake },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
          <img src="/logo-mark-ajdcb.png" alt="AJDCB" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">AJDCB Admin</p>
          <p className="text-slate-400 text-xs truncate">Espace de gestion</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon, comingSoon }) =>
          comingSoon ? (
            <div
              key={path}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-slate-500 cursor-not-allowed"
              title="Bientôt disponible"
            >
              <span className="flex items-center gap-3 text-[13px]">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              <span className="text-[9px] uppercase tracking-wide bg-white/5 px-1.5 py-0.5 rounded">
                Bientôt
              </span>
            </div>
          ) : (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors border-l-2',
                  isActive
                    ? 'bg-white/[0.06] text-white border-brand-green-500'
                    : 'text-slate-400 border-transparent hover:bg-white/[0.04] hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          )
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded bg-brand-green-600 flex items-center justify-center text-white text-[11px] font-bold font-mono shrink-0">
            {user?.initiales}
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-medium leading-tight truncate">{user?.nom_complet}</p>
            <p className="text-slate-500 text-[11px] truncate">{user?.role_label}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-green-50 lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 shrink-0">{SidebarContent}</aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-900 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="self-end m-3 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-slate-900 sticky top-0 z-40">
          <button onClick={() => setMobileOpen(true)} className="text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-sm">AJDCB Admin</span>
          <div className="w-6" />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
