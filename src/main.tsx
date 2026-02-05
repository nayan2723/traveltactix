import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Dev-only: clear any old Service Worker + caches to prevent stale Vite chunks
// causing "Invalid hook call" / dispatcher-null hook crashes.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  const cleanedFlag = "dev_sw_cleaned_once";

  (async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      if (!sessionStorage.getItem(cleanedFlag)) {
        sessionStorage.setItem(cleanedFlag, "1");
        location.reload();
      } else {
        sessionStorage.removeItem(cleanedFlag);
      }
    } catch {
      // ignore
    }
  })();
}

createRoot(document.getElementById("root")!).render(<App />);
