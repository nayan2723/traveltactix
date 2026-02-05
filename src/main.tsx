import { createRoot } from "react-dom/client";
import "./index.css";

/**
 * Prevent "Invalid hook call" / dispatcher-null crashes caused by stale Service Worker caches
 * in the Lovable/Vite preview.
 *
 * Key change: do the cleanup + reload BEFORE rendering React.
 */
async function bootstrap() {
  if (import.meta.env.DEV && "serviceWorker" in navigator) {
    const cleanedFlag = "dev_sw_cleaned_once";

    // First load after code changes: nuke SW + caches, reload, then render on next load.
    if (!sessionStorage.getItem(cleanedFlag)) {
      sessionStorage.setItem(cleanedFlag, "1");

      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } finally {
        // Reload regardless of cleanup result.
        location.reload();
      }

      return;
    }

    // Second load: proceed normally.
    sessionStorage.removeItem(cleanedFlag);
  }

  const { default: App } = await import("./App");
  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
