import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid2x2, Bookmark, CreditCard, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { enableSubscriptionFlow } from '@/config/appConfig';

const tabs = [
  { to: '/Home', icon: Home, label: 'Início' },
  { to: '/Browse', icon: Grid2x2, label: 'Catálogo' },
  { to: '/Search', icon: Search, label: 'Buscar' },
  { to: '/MyList', icon: Bookmark, label: 'Minha Lista' },
  ...(enableSubscriptionFlow ? [{ to: '/Subscription', icon: CreditCard, label: 'Assinar' }] : []),
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(null);

  const handleTap = (to) => {
    setPressed(to);
    setTimeout(() => setPressed(null), 150);
    // Se já está na aba, scroll para topo (comportamento nativo)
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(to);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-kid-page/98 backdrop-blur-lg border-t-2 border-kid-accent/25 rounded-t-3xl shadow-[0_-12px_40px_rgba(26,22,56,0.45)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 pt-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active =
            to === '/Browse'
              ? location.pathname === '/Browse'
              : location.pathname === to || (to !== '/Home' && location.pathname.startsWith(to));
          const isPressed = pressed === to;

          return (
            <button
              key={to}
              onClick={() => handleTap(to)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-kid-sun rounded-full shadow-sm shadow-kid-sun/40"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <motion.div
                animate={{ scale: isPressed ? 0.82 : 1 }}
                transition={{ duration: 0.1 }}
                className="flex flex-col items-center gap-0.5"
              >
                <Icon className={`w-6 h-6 transition-colors duration-150 ${active ? 'text-kid-sun' : 'text-gray-500'}`} />
                <span className={`text-[10px] font-display font-bold transition-colors duration-150 ${active ? 'text-kid-sun' : 'text-gray-500'}`}>
                  {label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}