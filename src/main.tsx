import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";

// Debug: ensure single React instance
if (typeof window !== "undefined") {
  // @ts-ignore
  console.log("[Debug] React main version:", React.version);
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
