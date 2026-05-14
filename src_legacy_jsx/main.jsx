import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'

if ('serviceWorker' in navigator) {
    if (import.meta.env.PROD) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered!', reg))
                .catch(err => console.log('SW registration failed!', err));
        });
    } else {
        // Dev mode: unregister to avoid caching issues
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(reg => {
                console.log('Unregistering SW for dev mode:', reg);
                reg.unregister();
            });
        });
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>,
)
