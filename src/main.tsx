import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { letterAudio } from './lib/audio/engine';
import { useAppStore } from './store/useAppStore';
import { useSessionStore } from './store/useSessionStore';
import './index.css';

// Attach the iOS audio unlock listeners before the first user gesture.
letterAudio.init();

registerSW({ immediate: true });

if (import.meta.env.DEV) {
  // Lets browser automation read exercises and answers during development.
  Object.assign(window, { __hone: { app: useAppStore, session: useSessionStore } });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
