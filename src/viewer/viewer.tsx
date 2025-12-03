import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function Viewer() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Manifest Viewer</h1>
      <p>Viewer loaded successfully</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Viewer />
  </React.StrictMode>
);
