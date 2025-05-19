import React, { startTransition } from 'react';
import ReactDOM from 'react-dom/client';
import App from '~/App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/GlobalStyles/GlobalStyles';
import { ConfigProvider } from 'antd';
import viVN from 'antd/es/locale/vi_VN';
import ReactGA from 'react-ga4';

// Import base CSS - don't add other CSS imports here to avoid localhost:1 error
import './index.css';

// Suppress React UNSAFE lifecycle method warnings
const suppressLifecycleWarnings = () => {
    // Suppress React lifecycle warnings
    const originalConsoleWarn = console.warn;
    console.warn = function filterWarnings(msg, ...args) {
        if (typeof msg === 'string' && msg.includes('UNSAFE_')) {
            return;
        }
        originalConsoleWarn(msg, ...args);
    };
};

suppressLifecycleWarnings();

// Configure React Router future flags to address warnings
window.__reactRouterGlobalStartTransition = startTransition;
window.__v7_startTransition = startTransition;
window.__v7_relativeSplatPath = true;

ReactGA.initialize('G-GRXHD0H7CY');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <GlobalStyles>
            <ConfigProvider locale={viVN}>
                <App />
            </ConfigProvider>
        </GlobalStyles>
    </React.StrictMode>,
);

ReactGA.send('pageview');

reportWebVitals();
