import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import api from './api/api'
import './index.css'
import App from './App.jsx'

const warmBackendOnStartup = () => {
  const globalKey = '__LOCAL_SERVICE_HEALTH_WARMED__'

  if (globalThis[globalKey]) return
  globalThis[globalKey] = true

  api
    .get('/health')
    .catch(() => {
      // Ignore warm-up failures; Render may still be waking up.
    })
}

warmBackendOnStartup()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
