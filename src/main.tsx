import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import Module, { MainModule } from "./wasm/hello";

Module().then((mod: MainModule) => {
  console.log(mod);
});



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
