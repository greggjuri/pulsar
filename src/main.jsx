import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PublicViewer } from './components/PublicViewer.jsx'

// Simple routing: check if URL matches /view/{id}
function getViewDiagramId() {
  const match = window.location.pathname.match(/^\/view\/(.+)$/);
  return match ? match[1] : null;
}

const viewDiagramId = getViewDiagramId();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {viewDiagramId ? <PublicViewer diagramId={viewDiagramId} /> : <App />}
  </StrictMode>,
)
