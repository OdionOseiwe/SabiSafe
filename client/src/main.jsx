import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import { WalletProvider } from "./context/WalletContext";

// Apply the saved text size before the first paint.
try {
  const saved = localStorage.getItem("sabisafe:text-size");
  if (saved) document.documentElement.dataset.textSize = saved;
} catch {
  // localStorage can be blocked; the default size still works.
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider>
        <ToastProvider>
          <AuthProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </AuthProvider>
        </ToastProvider>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
);
