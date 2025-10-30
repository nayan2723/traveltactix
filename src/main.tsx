import { createRoot } from "react-dom/client";
import * as React from "react";
import { version as reactVersion } from "react";
import { version as reactDomVersion } from "react-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";

console.log("[React] versions:", { reactVersion, reactDomVersion });
console.log("[React] useState identity:", React.useState);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
