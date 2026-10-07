import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StudyProvider } from './context/StudyContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StudyProvider>
        <App />
      </StudyProvider>
    </BrowserRouter>
  </StrictMode>
);
