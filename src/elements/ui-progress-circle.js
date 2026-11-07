import { UIElement, define } from "./base.js";

/**
 * <uif-progress-circle value="64" label="Uploading" size="md"></uif-progress-circle>
 * <uif-progress-circle label="Loading"></uif-progress-circle>
 *
 * Attributes:
 *   value — optional number from 0–100; omit for indeterminate state
 *   label — accessible name
 *   size  — "sm", "md" (default), "lg"
 */
class UIProgressCircle extends UIElement {
  static get observedAttributes() {
    return ["value", "label", "size"];
  }

  render() {
    const rawValue = this.getAttr("value");
    const determinate = rawValue !== "";
    const parsed = Number(rawValue);
    const value = determinate && Number.isFinite(parsed)
      ? Math.min(100, Math.max(0, parsed))
      : null;
    const label = this.getAttr("label", determinate ? "Progress" : "Loading");
    const size = this.getAttr("size", "md");
    const resolvedSize = ["sm", "md", "lg"].includes(size) ? size : "md";

    const classes = ["uif-progress-circle"];
    if (resolvedSize !== "md") classes.push(resolvedSize);
    if (value === null) classes.push("is-indeterminate");

    const valueAttrs = value === null
      ? ""
      : ` aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" style="--uif-progress-circle-value: ${value}"`;

    this.innerHTML = `<span class="${classes.join(" ")}" role="progressbar" aria-label="${label}"${valueAttrs}><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="uif-progress-circle-track" cx="18" cy="18" r="15.9155"></circle><circle class="uif-progress-circle-indicator" cx="18" cy="18" r="15.9155" pathLength="100"></circle></svg></span>`;
  }
}

define("uif-progress-circle", UIProgressCircle);
export { UIProgressCircle };
