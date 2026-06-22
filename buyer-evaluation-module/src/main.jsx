import React from 'react';
import ReactDOM from 'react-dom/client';
import AccountPage from './AccountPage.jsx';
import './index.css';

// Standalone harness entry → the unified account-page shell (Buyer Eval wired
// live + placeholders for the other stages). `DemoApp.jsx` (buyer/seller toggle)
// is still here if you want to run the module surfaces in isolation instead.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccountPage />
  </React.StrictMode>,
);
