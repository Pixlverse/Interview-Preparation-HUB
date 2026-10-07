import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StudyProvider } from './context/StudyContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* basename makes routes work when the site is served from a sub-path (GitHub Pages) */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <StudyProvider>
        <App />
      </StudyProvider>
    </BrowserRouter>
  </StrictMode>
);
