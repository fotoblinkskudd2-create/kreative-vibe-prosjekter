import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Fant ikke #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline-støtte. Registreres bare i produksjonsbygg, og bare over sikker opprinnelse.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Uten service worker fungerer appen som vanlig, bare ikke offline.
    });
  });
}
