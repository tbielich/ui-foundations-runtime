import { UIElement, define } from "./base.js";

let tooltipIdSequence = 0;

/**
 * <uif-tooltip text="Helpful info" placement="top">
 *   <button>Hover me</button>
 * </uif-tooltip>
 *
 * Attributes:
 *   text       — tooltip content
 *   placement  — "top" (default), "bottom", "left", "right"
 *   tooltip-id — optional explicit ID for the rendered tooltip
 */
class UITooltip extends UIElement {
  static get observedAttributes() {
    return ["text", "placement", "tooltip-id"];
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
    const explicitId = this.getAttr("tooltip-id").trim();
    const tooltipId = explicitId || this._tooltipId;

    this.innerHTML = `<span class="uif-tooltip-trigger">${this._authoredContent}<span class="uif-tooltip" role="tooltip" data-placement="${placement}">${text}</span></span>`;

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
