// Early diagnostic logging
console.log('🔵 [INIT] main.tsx starting to load...', new Date().toISOString());

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './shared/styles/accessibility.css'
import { serviceWorkerManager } from './shared/utils/serviceWorkerManager'

console.log('🔵 [INIT] All imports loaded successfully');

console.log('🔵 [INIT] Setting up service worker and accessibility...');

// Performance optimization: Register service worker after initial render
setTimeout(() => {
  console.log('🔵 [SW] Registering service worker...');
  serviceWorkerManager.register().catch(err => {
    console.warn('⚠️ [SW] Service worker registration failed:', err);
  });
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

console.log('🔵 [INIT] About to initialize React application...');
console.log('🔵 [INIT] Document ready state:', document.readyState);
console.log('🔵 [INIT] Root element exists:', !!document.getElementById('root'));

// Robust initialization with error handling
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = '❌ FATAL: Root element #root not found in DOM';
  console.error(errorMsg);
  console.error('Document body HTML:', document.body.innerHTML.substring(0, 500));
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui; background: #fee; min-height: 100vh;">
      <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Root Element Not Found</h1>
      <p style="margin-bottom: 16px;">Cannot initialize React application: #root element is missing from HTML.</p>
      <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
    </div>
  `;
} else {
  try {
    console.log('✅ [INIT] Root element found successfully');
    console.log('🔵 [INIT] Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('🔵 [INIT] Rendering App component...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ [INIT] React app rendered successfully!');
    console.log('✅ [INIT] Application initialization complete');
  } catch (error) {
    const errorMsg = '❌ FATAL: Failed to initialize React application';
    console.error(errorMsg, error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui; background: #fee; min-height: 100vh;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ Application Initialization Error</h1>
        <p style="margin-bottom: 16px;">Failed to initialize the React application.</p>
        <details style="margin: 20px auto; max-width: 600px; text-align: left;">
          <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Error Details</summary>
          <pre style="background: #fff; padding: 16px; border-radius: 8px; overflow: auto; border: 1px solid #ddd;">${error instanceof Error ? error.message + '\n\n' + error.stack : String(error)}</pre>
        </details>
        <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}