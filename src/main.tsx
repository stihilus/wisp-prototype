import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { PrototypeProvider } from './store/prototype'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrototypeProvider>
      <App />
    </PrototypeProvider>
  </StrictMode>,
)
