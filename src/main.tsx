import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely register Service Worker only outside of sandboxed iframes
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  let isRestrictedIframe = false;
  try {
    isRestrictedIframe = window.self !== window.top;
  } catch {
    isRestrictedIframe = true;
  }

  if (!isRestrictedIframe && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('ServiceWorker registration deferred:', err);
        });
      } catch (e) {
        console.debug('ServiceWorker registration not allowed in current context:', e);
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

