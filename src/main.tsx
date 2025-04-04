
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Toaster } from "sonner";

// Check if AdBlock is enabled and warn users if it is
const detectAdBlock = async () => {
  try {
    const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', { 
      method: 'HEAD', 
      mode: 'no-cors',
      cache: 'no-store'
    });
    return false;
  } catch (error) {
    console.log('AdBlock detected');
    return true;
  }
};

// Initialize app
const init = async () => {
  const adBlockDetected = await detectAdBlock();
  
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
};

init();
