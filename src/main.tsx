import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ PWA Service Worker kaydedildi:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      },
      (error) => {
        console.log('❌ Service Worker kaydı başarısız:', error);
      }
    );
  });
}

createRoot(document.getElementById("root")!).render(<App />);
