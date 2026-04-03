import '@/index.css';
import '@/globals.css';
import { useFirestoreData } from '@/config/appConfig';

async function start() {
  if (!useFirestoreData) {
    const { hydrateCatalogBootstrap } = await import('@/lib/catalogHydration');
    await hydrateCatalogBootstrap();

    const { flushCatalogSyncNow } = await import('@/lib/catalogPersistence');
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushCatalogSyncNow();
      }
    });
    window.addEventListener('pagehide', () => {
      flushCatalogSyncNow();
    });
  }

  const [{ default: App }, React, { default: ReactDOM }] = await Promise.all([
    import('@/App.jsx'),
    import('react'),
    import('react-dom/client'),
  ]);

  document.documentElement.classList.add('dark');

  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(App)
  );
}

start();
