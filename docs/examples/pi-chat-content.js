import { renderContent } from "ui-foundations/behaviors/content";
import "ui-foundations/core.css";
import "ui-foundations/ui.css";

// Vite includes this published-package entry. No local Runtime copy.
const options = {
  headingLevel: 4, copy: true,
  labels: { copy: "Code kopieren", copied: "Code kopiert.", failed: "Kopieren nicht verfügbar. Code bitte markieren und manuell kopieren.", code: "Codebeispiel", table: "Tabelle" },
};
window.uifRenderContent = renderContent;
// The classic chat client can run before this module: upgrade its text fallback.
document.querySelectorAll("[data-uif-answer]").forEach(target => {
  if (!target.classList.contains("uif-content")) {
    target.classList.remove("uif-code");
    renderContent(target, target.textContent, options);
  }
});
