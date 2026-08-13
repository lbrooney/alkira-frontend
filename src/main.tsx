import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <div className="grid h-full place-items-center">
      <p className="font-medium">Alkira Portal</p>
    </div>
  </StrictMode>,
)
