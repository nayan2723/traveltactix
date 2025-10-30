import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";

if (typeof window !== "undefined") {
  (window as any).__react_ref_main = React;
  // @ts-ignore
  console.log("[Debug] React main version:", React.version);
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
