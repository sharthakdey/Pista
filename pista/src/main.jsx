import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";

// Single-file hosted builds (VITE_ROUTER=hash) have no server rewrites, so use hash routes there.
const Router = import.meta.env.VITE_ROUTER === "hash" ? HashRouter : BrowserRouter;
import "./index.css";
import App from "./App.jsx";
import { StudyProvider } from "./context/StudyContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <StudyProvider>
        <App />
      </StudyProvider>
    </Router>
  </React.StrictMode>
);
