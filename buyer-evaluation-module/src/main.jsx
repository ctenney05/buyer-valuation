import React from 'react';
import ReactDOM from 'react-dom/client';
import DemoApp from './DemoApp.jsx';
import './index.css';

// Standalone harness entry. The real integration mounts BuyerPortal and/or
// SellerDashboard directly — see README.md.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>,
);
