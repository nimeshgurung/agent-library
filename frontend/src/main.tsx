import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const mountNode = document.getElementById('root');

if (!(mountNode instanceof HTMLElement)) {
  throw new Error('Expected #root element to exist in the document.');
}

const root = createRoot(mountNode);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
