import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { DarkModeProvider } from "./hooks/darkmode";
import { NotesProvider } from "./hooks/NotesContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <DarkModeProvider>
    <NotesProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </NotesProvider>
  </DarkModeProvider>
);
