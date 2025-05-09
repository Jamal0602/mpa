
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider"

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

// Add Google AdSense
const injectAdSenseScript = () => {
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7483780622360467';
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

// Initialize app
const init = async () => {
  const adBlockDetected = await detectAdBlock();
  
  if (!adBlockDetected) {
    injectAdSenseScript();
  }
  
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </ThemeProvider>
  );
};

init();
