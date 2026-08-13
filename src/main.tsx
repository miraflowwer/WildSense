import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GahmProvider } from './store/store'
import { AuthProvider } from './auth/AuthProvider'
import { I18nProvider } from './i18n/I18nContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <I18nProvider>
        <GahmProvider>
          <App />
        </GahmProvider>
      </I18nProvider>
    </AuthProvider>
  </StrictMode>,
)
