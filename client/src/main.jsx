import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/themeContext.jsx";
import { AuthProvider } from "./contexts/authContext.jsx";
import { NotificationsProvider } from "./contexts/notificationsContext.jsx";
import { BranchProvider } from "./contexts/BranchContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BranchProvider>
          <NotificationsProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <App />
            </BrowserRouter>
          </NotificationsProvider>
        </BranchProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
