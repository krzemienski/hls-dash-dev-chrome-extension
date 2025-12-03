import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function Popup() {
  return (
    <div className="w-[350px] h-[500px] p-4">
      <h1 className="text-xl font-bold">HLS + DASH Viewer</h1>
      <p className="text-sm text-gray-600">Popup loaded successfully</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
