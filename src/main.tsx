import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './shared/styles/accessibility.css'
import { serviceWorkerManager } from './shared/utils/serviceWorkerManager'

// Performance optimization: Register service worker after initial render
setTimeout(() => {
  serviceWorkerManager.register()
}, 1000)

// Accessibility enhancement: Initialize focus management
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('using-keyboard')
  }
})

document.addEventListener('mousedown', () => {
  document.body.classList.remove('using-keyboard')
})

// Add high contrast detection
if (window.matchMedia('(prefers-contrast: high)').matches) {
  document.body.classList.add('prefers-high-contrast')
}

// Add reduced motion detection
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('prefers-reduced-motion')
}

// Robust initialization with error handling
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ FATAL: Root element not found in DOM');
  document.body.innerHTML = '<div style="padding: 40px; text-align: center;"><h1>Error: Root element not found</h1><p>Cannot initialize React application.</p></div>';
} else {
  try {
    console.log('✅ Root element found, initializing React...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ FATAL: Failed to initialize React:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Application Error</h1>
        <p style="margin-bottom: 16px;">Failed to initialize the React application.</p>
        <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: left; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}