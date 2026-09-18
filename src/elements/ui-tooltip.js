import { UIElement, define } from "./base.js";

const parseDelay = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

let tooltipIdSequence = 0;

/**
 * <uif-tooltip text="Helpful info" placement="top">
 *   <button>Hover me</button>
 * </uif-tooltip>
 *
 * Attributes:
 *   text       — tooltip content
 *   placement   — "top" (default), "bottom", "left", "right"
 *   tooltip-id  — optional explicit ID for the rendered tooltip
 *   show-delay  — delay before showing in milliseconds (default: 300)
 *   hide-delay  — delay before hiding in milliseconds (default: 0)
 */
class UITooltip extends UIElement {
  static get observedAttributes() {
    return ["text", "placement", "tooltip-id", "show-delay", "hide-delay"];
  }

  constructor() {
    super();
    this._tooltipId = `uif-tooltip-${++tooltipIdSequence}`;
    this._authoredContent = null;
  }

  render() {
    if (this._authoredContent === null) {
      this._authoredContent = this.innerHTML;
    }

    const text = this.getAttr("text");
    const placement = this.getAttr("placement", "top");
    const showDelay = parseDelay(this.getAttr("show-delay", "300"), 300);
    const hideDelay = parseDelay(this.getAttr("hide-delay", "0"), 0);
    const explicitId = this.getAttr("tooltip-id").trim();
    const tooltipId = explicitId || this._tooltipId;

    this.innerHTML = `<span class="uif-tooltip-trigger" style="--uif-tooltip-show-delay: ${showDelay}ms; --uif-tooltip-hide-delay: ${hideDelay}ms">${this._authoredContent}<span class="uif-tooltip" role="tooltip" data-placement="${placement}">${text}</span></span>`;

    const wrapper = this.querySelector(":scope > .uif-tooltip-trigger");
    const tooltip = wrapper?.querySelector(":scope > .uif-tooltip");
    if (!wrapper || !tooltip) return;

    tooltip.id = tooltipId;

    const trigger = Array.from(wrapper.children).find((child) => child !== tooltip);
    if (!trigger) return;

    const describedBy = new Set(
      (trigger.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean),
    );
    describedBy.add(tooltipId);
    trigger.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
  }
}

define("uif-tooltip", UITooltip);
export { UITooltip };
