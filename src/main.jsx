// Deploy refresh marker: latest Summer OS build
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PromptPracticeModule from "./modules/PromptPracticeModule.jsx";
import "./index.css";
import "./discipline.css";
import "./faith.css";
import "./experiences.css";
import "./reflection.css";
import "./operationArchive.css";
import "./rewards.css";
import "./modernTheme.css";
import "./xpSystem.css";
import "./backupSystem.css";
import "./promptPractice.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const promptPracticeRoot = document.createElement("section");
promptPracticeRoot.className = "standalone-prompt-practice-shell panel";
promptPracticeRoot.setAttribute("aria-label", "Response Practice Module");
document.body.appendChild(promptPracticeRoot);

ReactDOM.createRoot(promptPracticeRoot).render(
  <React.StrictMode>
    <div className="section-title">
      <h2>Response Practice</h2>
    </div>
    <p className="muted">
      Generate a scenario, write your answer, grade it, save it, and review your archive.
    </p>
    <PromptPracticeModule />
  </React.StrictMode>
);
