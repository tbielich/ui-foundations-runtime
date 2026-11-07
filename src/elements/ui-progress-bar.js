import { UIElement, define } from "./base.js";

/** Task completion from 0 to 100. Missing, empty or invalid values are indeterminate. */
class UIProgressBar extends UIElement {
  static get observedAttributes() {
    return ["value", "variant", "size", "label", "show-value", "indeterminate"];
  }

  render() {
    const raw = this.getAttr("value").trim();
    const parsed = Number(raw);
    const indeterminate = this.getBool("indeterminate") || raw === "" || !Number.isFinite(parsed);
    const value = indeterminate ? null : Math.min(100, Math.max(0, parsed));
    const variant = this.getAttr("variant", "default");
    const size = this.getAttr("size", "md");
    const label = this.getAttr("label").trim();
    const showValue = this.getBool("show-value") && !indeterminate;
    const root = document.createElement("div");
    root.className = "uif-progress-bar";
    if (["positive", "negative"].includes(variant)) root.classList.add(variant);
    if (["sm", "lg"].includes(size)) root.classList.add(size);
    if (indeterminate) root.classList.add("is-indeterminate");
    root.setAttribute("role", "progressbar");
    root.setAttribute("aria-label", label || (indeterminate ? "Loading" : "Progress"));
    root.setAttribute("aria-valuemin", "0");
    root.setAttribute("aria-valuemax", "100");
    if (!indeterminate) root.setAttribute("aria-valuenow", String(value));

    if (label || showValue) {
      const header = document.createElement("div");
      header.className = "uif-progress-bar-header";
      if (label) {
        const text = document.createElement("span");
        text.className = "uif-progress-bar-label";
        text.textContent = label;
        header.append(text);
      }
      if (showValue) {
        const text = document.createElement("span");
        text.className = "uif-progress-bar-value";
        text.textContent = `${Math.round(value)}%`;
        header.append(text);
      }
      root.append(header);
    }
    const track = document.createElement("div");
    track.className = "uif-progress-bar-track";
    const fill = document.createElement("div");
    fill.className = "uif-progress-bar-fill";
    if (!indeterminate) fill.style.setProperty("--_progress", String(value));
    track.append(fill);
    root.append(track);
    this.replaceChildren(root);
  }
}

define("uif-progress-bar", UIProgressBar);
export { UIProgressBar };
