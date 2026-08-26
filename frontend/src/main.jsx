import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IconContext } from '@phosphor-icons/react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IconContext.Provider
      value={{
        weight: 'duotone',
        mirrored: false,
      }}
    >
      <App />
    </IconContext.Provider>
  </StrictMode>,
)
