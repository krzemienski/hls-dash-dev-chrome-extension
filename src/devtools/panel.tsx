import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function DevToolsPanel() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">Manifest Panel</h1>
      <p className="text-sm">DevTools panel loaded</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DevToolsPanel />
  </React.StrictMode>
);
