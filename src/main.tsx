
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" richColors />
  </BrowserRouter>
);
