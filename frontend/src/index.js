import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// هاد الملف هالحين صار "نظيف" وبنادي بس المهم
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);