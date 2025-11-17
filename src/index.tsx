import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@material-tailwind/react";
import { theme } from './Theme/Theme';
import './index.css';
import App from './App';

// Suppress harmless browser extension errors
window.addEventListener('error', (event) => {
  // Filter out browser extension errors (proxy.js, port disconnection, etc.)
  if (
    event.message && (
      event.message.includes('disconnected port object') ||
      event.message.includes('proxy.js') ||
      event.message.includes('Extension context invalidated')
    )
  ) {
    event.preventDefault();
    return false;
  }
});

// Also catch unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason && (
      event.reason.message?.includes('disconnected port object') ||
      event.reason.message?.includes('proxy.js') ||
      event.reason.message?.includes('Extension context invalidated')
    )
  ) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider value={theme}>
      <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

export {};
