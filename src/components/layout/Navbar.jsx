import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NotificationCenter from '@/components/admin/NotificationCenter';
import { brand } from '@/data/siteContent';
import { readActiveProfile } from '@/lib/activeProfile';
import ProfileAvatarImage from '@/components/profile/ProfileAvatarImage';
import { useAuth } from '@/lib/AuthContext';
import { enableAdminPanel, enableSubscriptionFlow } from '@/config/appConfig';

export default function Navbar({ isStackRoute = false }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const browseType = searchParams.get('type');
  const navLinkActive = (to) => {
    if (to === '/Home') return location.pathname === '/Home';
    if (to === '/Browse?type=series') {
      return location.pathname === '/Browse' && browseType === 'series';
    }
    if (to === '/Browse?type=movie') {
      return location.pathname === '/Browse' && browseType === 'movie';
    }
    if (to === '/MyList') return location.pathname === '/MyList';
    if (to === '/Subscription') return location.pathname === '/Subscription';
    return false;
  };

  const links = [
    { label: 'Início', to: '/Home' },
    { label: 'Séries', to: '/Browse?type=series' },
    { label: 'Filmes', to: '/Browse?type=movie' },
    { label: 'Minha Lista', to: '/MyList' },
    ...(enableSubscriptionFlow ? [{ label: 'Assinar', to: '/Subscription' }] : []),
  ];

  const activeProfile = readActiveProfile();

  // Navbar de stack (SeriesDetail, Player) — só mostra botão voltar no mobile
  if (isStackRoute) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-kid-page/95 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center h-14 px-2">
          <button
            onClick={() => navigate(-1)}
            className="md:hidden flex items-center gap-2 p-2 text-white active:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {/* Desktop: mantém logo e links */}
          <Link to="/Home" className="hidden md:flex items-center ml-4" aria-label="Início">
            <img src={brand.logoUrl} alt={brand.name} className="h-10 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-6 ml-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-display font-semibold transition-colors hover:text-kid-sun ${navLinkActive(l.to) ? 'text-kid-sun' : 'text-gray-400'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // Navbar padrão (tabs)
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-kid-page/95 backdrop-blur-md shadow-lg shadow-kid-accent/10' : 'bg-gradient-to-b from-kid-page/92 via-kid-page/40 to-transparent'}`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-8">
            <Link to="/Home" className="flex items-center shrink-0">
              <img src={brand.logoUrl} alt={brand.name} className="h-10 md:h-12 w-auto object-contain" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-display font-semibold transition-colors hover:text-kid-sun ${navLinkActive(l.to) ? 'text-kid-sun' : 'text-gray-400'}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/Search" className="p-2 hover:text-kid-accent transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            {enableSubscriptionFlow && (
              <Link
                to="/Subscription"
                className={`hidden md:block text-sm font-display font-bold px-5 py-2 rounded-full border-2 transition-all shadow-sm ${location.pathname === '/Subscription' ? 'bg-kid-accent border-kid-accent text-white shadow-kid-accent/25' : 'border-kid-sun/60 text-kid-sun hover:bg-kid-sun hover:text-kid-page-deep'}`}
              >
                Assinar
              </Link>
            )}
            {enableAdminPanel && isAdmin && (
              <>
                <NotificationCenter />
                <Link to="/Admin" className="hidden md:block text-xs text-gray-400 hover:text-kid-sun transition-colors font-medium">
                  Admin
                </Link>
              </>
            )}
            <Link to="/ProfileSelect" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-kid-accent flex items-center justify-center ring-2 ring-kid-sun/40 group-hover:ring-kid-sun/70 transition-all shadow-md">
                {activeProfile?.avatar_url ? (
                  <ProfileAvatarImage
                    src={activeProfile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {activeProfile?.name?.[0] || user?.full_name?.[0] || '?'}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}