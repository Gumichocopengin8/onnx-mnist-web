import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import App from './App.tsx';
import './index.css';

// biome-ignore lint: safe to do non-null assertion here since the react official does that too
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme accentColor='cyan' appearance='dark' radius='full'>
      <App />
    </Theme>
  </StrictMode>
);
