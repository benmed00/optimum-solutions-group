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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)