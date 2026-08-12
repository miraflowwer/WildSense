import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GahmProvider } from './store/store'
import { AuthProvider } from './auth/authContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GahmProvider>
        <App />
      </GahmProvider>
    </AuthProvider>
  </StrictMode>,
)
