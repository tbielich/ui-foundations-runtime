import { UIElement, define } from "./base.js";

/**
 * Decorative loading placeholders. Put aria-busy="true" and a visible or
 * screen-reader loading label on the containing content region.
 */
class UISkeleton extends UIElement {
  static get observedAttributes() {
    return ["shape", "lines", "width", "height"];
  }

  render() {
    const shape = ["text", "circle", "rectangle"].includes(this.getAttr("shape"))
      ? this.getAttr("shape")
      : "text";
    const parsedLines = Number.parseInt(this.getAttr("lines", "1"), 10);
    const lines = shape === "text" && Number.isFinite(parsedLines)
      ? Math.min(12, Math.max(1, parsedLines))
      : 1;
    const width = this.getAttr("width").trim();
    const height = this.getAttr("height").trim();

    const group = this.ownerDocument.createElement("span");
    group.className = "uif-skeleton-group";
    group.setAttribute("aria-hidden", "true");
    for (let index = 0; index < lines; index += 1) {
      const item = this.ownerDocument.createElement("span");
      item.className = `uif-skeleton ${shape}`;
      if (index === lines - 1 && lines > 1) item.classList.add("is-last-line");
      if (width) item.style.inlineSize = width;
      if (height) item.style.blockSize = height;
      group.append(item);
    }

    this.setAttribute("aria-hidden", "true");
    this.replaceChildren(group);
  }
}

define("uif-skeleton", UISkeleton);
export { UISkeleton };
